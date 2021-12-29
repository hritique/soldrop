import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Cluster,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
} from '@solana/web3.js';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { v4 as uuid } from 'uuid';
import './App.css';
import AccountsTable from './components/AccountsTable';
import Header from './components/Header';
import DownloadSignerKeypair from './components/modals/DownloadSignerKeypair';
import TokenInput from './components/TokenInput';
import {
  addDecimalNumberStrings,
  downloadFile,
  getConnection,
} from './utils/functions';
import { createTokenTransferInstruction } from './utils/instructions';
import { theme } from './utils/theme';
import { Account, Solana, SolanaToken, TransactionStatus } from './utils/types';
import {
  calculateTotalSolRequired,
  transferTokenToTemporaryAccount,
} from './utils/web3';

const defaultContextValue = {
  accounts: [],
  wallet: undefined,
};
interface ContextType {
  accounts: Account[];
  wallet?: Solana;
  selectedToken?: SolanaToken;
  temporarySignerAccount?: Keypair;
  setAccounts?: Dispatch<SetStateAction<Account[]>>;
  setWallet?: Dispatch<SetStateAction<Solana | undefined>>;
  setSelectedToken?: Dispatch<SetStateAction<SolanaToken | undefined>>;
  setTemporarySignerAccount?: Dispatch<SetStateAction<Keypair | undefined>>;
}

export const AppContext = React.createContext<ContextType>(defaultContextValue);

function App() {
  const [wallet, setWallet] = React.useState<Solana | undefined>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedToken, setSelectedToken] = useState<SolanaToken | undefined>();
  const [temporarySignerAccount, setTemporarySignerAccount] = useState<
    Keypair | undefined
  >(new Keypair());
  const [showDownloadKeyModal, setShowDownloadKeyModal] = useState(false);

  const [transactionMessage, setTransactionMessage] = useState<
    string | undefined
  >('Submitting transaction...');

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleSubmit = async () => {
    setShowDownloadKeyModal(true);
  };

  const handleProceed = async () => {
    setIsSubmitting(true);
    setShowDownloadKeyModal(false);
    const connection = getConnection(
      process.env.REACT_APP_SOLANA_CLUSTER as Cluster
    );
    if (
      wallet &&
      selectedToken &&
      temporarySignerAccount &&
      accounts.length > 0
    ) {
      // Transfer the total required tokens to the temporary account
      const totalTokenToTransfer = addDecimalNumberStrings(
        accounts.map((a) => a.amount),
        selectedToken.decimals
      );

      if (totalTokenToTransfer >= Number(selectedToken.tokenAmount)) {
        setIsSubmitting(false);
        return alert('Insufficient tokens');
      }

      let numberOfNewAccounts = 1; // 1 for temporary account

      const newAccountRequirement = await batchRequests(
        accounts.slice(0, 20),
        10,
        1000,
        async (address, index) => {
          if (address.publicKey.value) {
            setTransactionMessage(
              `Fetching token account details for account: ${index + 1}/${
                accounts.length
              }`
            );
            const { value: ownerTokenAccounts } =
              await connection.getTokenAccountsByOwner(
                address.publicKey.value,
                {
                  mint: selectedToken.mint,
                }
              );

            return ownerTokenAccounts.length < 1;
          } else {
            return false;
          }
        }
      );

      numberOfNewAccounts += newAccountRequirement.filter((a) => a).length;

      const totalSolRequiredInLamports = await calculateTotalSolRequired(
        connection,
        accounts,
        numberOfNewAccounts
      );

      if (totalSolRequiredInLamports >= wallet.balanceInLamports) {
        setIsSubmitting(false);
        return alert('Insufficient SOL balance');
      }

      setTransactionMessage('Transferring tokens to temporary account');
      const temporaryAccountATA = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        selectedToken.mint,
        temporarySignerAccount.publicKey
      );

      await transferTokenToTemporaryAccount(
        connection,
        selectedToken,
        totalTokenToTransfer * Math.pow(10, selectedToken.decimals),
        wallet,
        temporarySignerAccount,
        temporaryAccountATA,
        totalSolRequiredInLamports
      );

      // Storing each tx response for final report
      const responses: {
        address?: string;
        response?: string;
        txHash?: string;
      }[] = [];

      setTransactionMessage('Transferring tokens in individual accounts');

      await Promise.all(
        accounts.map(async (account, i) => {
          let updatedAccounts = [...accounts];

          if (!account.publicKey.isValid) return null;

          const instructions = await createTokenTransferInstruction(
            connection,
            temporaryAccountATA,
            account.publicKey.value || wallet.publicKey,
            selectedToken?.mint,
            Number(account.amount) * LAMPORTS_PER_SOL,
            temporarySignerAccount
          );

          if (instructions) {
            updatedAccounts[i].transaction.status = TransactionStatus.PROGRESS;
            setAccounts(updatedAccounts);
            responses[i] = {};
            responses[i].address = account.publicKey.asString;

            const { blockhash: recentBlockhash } =
              await connection.getRecentBlockhash();

            const transaction = new Transaction({
              feePayer: temporarySignerAccount.publicKey,
              recentBlockhash,
            });

            transaction.add(...instructions);

            try {
              const txHash = await connection.sendTransaction(transaction, [
                temporarySignerAccount,
              ]);

              updatedAccounts[i].transaction.hash = txHash;
              setAccounts(updatedAccounts);

              await connection.confirmTransaction(txHash);

              updatedAccounts[i].transaction.status =
                TransactionStatus.SUCCESSFUL;
              setAccounts(updatedAccounts);
              responses[i].response = 'Transaction successful';
              responses[i].txHash = txHash;
            } catch (error) {
              updatedAccounts[i].transaction.status = TransactionStatus.FAILED;
              setAccounts(updatedAccounts);
              responses[i].response = 'Transaction failed';
            }
          } else {
            updatedAccounts[i].transaction.status = TransactionStatus.IDLE;
            setAccounts(updatedAccounts);
            responses[i].response =
              'Transaction skipped as the account does not exist';
          }
        })
      );

      setTemporarySignerAccount(undefined);
      downloadFile(JSON.stringify({ result: responses }), 'Result.json');
      setTimeout(() => {
        setTransactionMessage('Airdrop successfully completed');
        setIsSubmitting(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const emptyAccounts: Account[] = [0, 0, 0, 0].map(() => {
      return {
        id: uuid(),
        publicKey: {
          isValid: false,
          asString: '',
          value: undefined,
        },
        amount: '',
        transaction: { status: TransactionStatus.IDLE },
      };
    });

    setAccounts(emptyAccounts);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AppContext.Provider
        value={{
          accounts: accounts,
          wallet,
          selectedToken,
          temporarySignerAccount,
          setAccounts: setAccounts,
          setWallet,
          setSelectedToken,
          setTemporarySignerAccount,
        }}
      >
        <Container>
          <Header />
          <Content>
            <Main>
              <TokenInput tokens={wallet?.tokens || []} />
              <AccountsTable />
            </Main>
          </Content>
          <Footer>
            {showDownloadKeyModal && (
              <DownloadSignerKeypair
                onClose={() => setShowDownloadKeyModal(false)}
                onProceed={handleProceed}
              />
            )}

            {accounts.filter((a) => a.publicKey.isValid).length > 0 ? (
              <span className="gas-fees">
                Approximate Gas Fees:{' '}
                {(
                  accounts.filter((a) => a.publicKey.isValid).length * 0.000005
                ).toFixed(5)}{' '}
                SOL
              </span>
            ) : null}

            <SubmitButton
              onClick={handleSubmit}
              disabled={!wallet || isSubmitting || !(accounts.length > 0)}
            >
              {isSubmitting ? transactionMessage : 'Airdrop tokens'}
            </SubmitButton>
          </Footer>
        </Container>
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export default App;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.background};
`;

const Content = styled.div`
  width: 100%;
  padding: 2rem;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: auto;
`;

const Main = styled.main`
  max-width: 50rem;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Footer = styled.footer`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  z-index: 1;
  bottom: 0;
  left: 0;
  background-color: ${(props) => props.theme.colors.background};

  .gas-fees {
    display: inline-block;
    width: 50rem;
    text-align: right;
    font-size: 0.8rem;
  }
`;

const SubmitButton = styled.button`
  border: none;
  outline: none;
  width: 50rem;
  padding: 1rem;
  margin: auto;
  color: inherit;
  background-color: ${(props) => props.theme.colors.primary};
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
