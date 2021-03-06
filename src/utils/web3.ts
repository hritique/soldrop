import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { TokenListProvider } from '@solana/spl-token-registry';
import {
  Cluster,
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { Account, Solana, SolanaToken } from './types';

export const getAllTokensOwnedByUser = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<Solana['tokens']> => {
  const memcmpFilter = {
    memcmp: { bytes: publicKey.toString(), offset: 32 },
  };
  const config = {
    filters: [{ dataSize: 165 }, memcmpFilter],
    encoding: 'jsonParsed',
  };

  const programAccounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID,
    config
  );

  const parsedProgramAccounts = programAccounts.map((a) => {
    return {
      ...(a.account.data as ParsedAccountData).parsed.info,
      publicKey: a.pubkey,
    };
  });

  const tokenListProvider = new TokenListProvider();

  const tokens = await tokenListProvider.resolve();
  const tokenList = tokens
    .filterByClusterSlug(process.env.REACT_APP_SOLANA_CLUSTER as Cluster)
    .getList();

  return parsedProgramAccounts.map((a) => {
    const tokenData = tokenList.find((token) => token.address === a.mint);

    return {
      mint: new PublicKey(a.mint),
      address: a.publicKey,
      tokenAmount: a.tokenAmount.uiAmountString || `${a.tokenAmount.uiAmount}`,
      name: tokenData ? tokenData.name : a.mint,
      logo: tokenData && tokenData.logoURI,
      decimals: a.tokenAmount.decimals,
    };
  });
};

export const getATAInfo = async (
  connection: Connection,
  owner: PublicKey,
  tokenMint: PublicKey
): Promise<{ address: PublicKey; exists: boolean }> => {
  const associatedTokenAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    tokenMint,
    owner
  );

  const associatedTokenAccountInfo = await connection.getAccountInfo(
    associatedTokenAddress
  );

  if (associatedTokenAccountInfo) {
    return { address: associatedTokenAddress, exists: true };
  } else {
    return { address: associatedTokenAddress, exists: false };
  }
};

export const calculateTotalSolRequired = async (
  connection: Connection,
  accounts: Account[],
  numberOfNewAccounts: number
) => {
  const minimumBalanceForRentExemption =
    await Token.getMinBalanceRentForExemptAccount(connection);

  const totalRentFeeInLamports =
    minimumBalanceForRentExemption * numberOfNewAccounts;

  const {
    feeCalculator: { lamportsPerSignature },
  } = await connection.getRecentBlockhash();

  const totalTransactionFeesInLamports =
    (accounts.length + 1) * lamportsPerSignature;

  return totalRentFeeInLamports + totalTransactionFeesInLamports;
};

export const transferTokenToTemporaryAccount = async (
  connection: Connection,
  token: SolanaToken,
  totalAmountOfTokensInLamports: number,
  wallet: Solana,
  temporaryAccount: Keypair,
  temporaryAccountATA: PublicKey,
  totalSolForAtaAndFeeInLamports: number
) => {
  const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();
  const transaction = new Transaction({
    feePayer: wallet.publicKey,
    recentBlockhash,
  });

  // Transferring funds for tx fees & ATA rent
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: temporaryAccount.publicKey,
      lamports: totalSolForAtaAndFeeInLamports,
    })
  );

  transaction.add(
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      token.mint,
      temporaryAccountATA,
      temporaryAccount.publicKey,
      wallet.publicKey
    )
  );

  transaction.add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      token.address,
      temporaryAccountATA,
      wallet.publicKey,
      [],
      totalAmountOfTokensInLamports
    )
  );

  const signed = await wallet.signTransaction(transaction);
  const txHash = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(txHash);

  return txHash;
};
