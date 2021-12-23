import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { TokenListProvider } from '@solana/spl-token-registry';
import {
  Cluster,
  clusterApiUrl,
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { Account, Solana, SolanaToken } from './types';

export const getConnection = (endpoint: Cluster) => {
  return new Connection(clusterApiUrl(endpoint));
};

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
      tokenAmount: a.tokenAmount.uiAmount,
      name: tokenData ? tokenData.name : a.mint,
      logo: tokenData && tokenData.logoURI,
    };
  });
};

const getATAInfo = async (
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
  addresses: Account[],
  token: SolanaToken
) => {
  const { mint: tokenMint } = token;
  let numberOfNewAccounts = 1; // 1 for the creation of ATA for the signer account

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    if (address.publicKey.value) {
      const associatedTokenAccount = await getATAInfo(
        connection,
        address.publicKey.value,
        tokenMint
      );

      if (associatedTokenAccount.exists) {
        numberOfNewAccounts++;
      }
    }
  }

  const minimumBalanceForRentExemption =
    await Token.getMinBalanceRentForExemptAccount(connection);

  const totalRentFeeInLamports =
    minimumBalanceForRentExemption * numberOfNewAccounts;

  return totalRentFeeInLamports * 10;
};

export const transferTokenToTemporaryAccount = async (
  connection: Connection,
  token: SolanaToken,
  totalAmountOfTokensInLamports: number,
  wallet: Solana,
  temporaryAccount: Keypair,
  totalSolForAtaAndFeeInLamports: number
) => {
  const associatedTokenAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    token.mint,
    temporaryAccount.publicKey
  );

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
      associatedTokenAddress,
      temporaryAccount.publicKey,
      wallet.publicKey
    )
  );

  transaction.add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      token.address,
      associatedTokenAddress,
      wallet.publicKey,
      [],
      totalAmountOfTokensInLamports
    )
  );

  const signed = await wallet.signTransaction(transaction);
  const txHash = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(txHash);

  return { txHash, associatedTokenAddress };
};

export const createTokenTransferInstruction = async (
  connection: Connection,
  from: PublicKey,
  to: PublicKey,
  mint: PublicKey,
  amount: number,
  signer: Keypair
) => {
  const instructions = [];
  let receiverTokenAddress = to;

  const info = await connection.getAccountInfo(to);

  if (!info) {
    return;
  }

  // If the address is not a token address
  if (info && info.owner !== TOKEN_PROGRAM_ID) {
    // Fetch existing token account
    const accounts = await connection.getTokenAccountsByOwner(to, { mint });
    if (accounts.value.length > 0) {
      const [account] = accounts.value;
      receiverTokenAddress = account.pubkey;
    } else {
      // Calculate associated token address
      const associatedTokenAccount = await getATAInfo(connection, to, mint);

      // If it does not exist, add the instruction to create the account
      if (!associatedTokenAccount.exists) {
        instructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint,
            associatedTokenAccount.address,
            to,
            signer.publicKey
          )
        );
      }

      receiverTokenAddress = associatedTokenAccount.address;
    }
  }

  instructions.push(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      from,
      receiverTokenAddress,
      signer.publicKey,
      [],
      amount
    )
  );

  return instructions;
};

export const downloadFile = async (data: string, fileName: string) => {
  const aTag = document.createElement('a');
  aTag.style.display = 'none';
  document.body.appendChild(aTag);
  const blob = new Blob([data], { type: 'octet/stream' });
  const downloadUrl = window.URL.createObjectURL(blob);
  aTag.href = downloadUrl;
  aTag.download = fileName;
  aTag.click();
  window.URL.revokeObjectURL(downloadUrl);
  aTag.remove();
};
