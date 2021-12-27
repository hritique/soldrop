import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getATAInfo } from './web3';

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
