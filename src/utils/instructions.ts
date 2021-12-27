import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

export const createTokenTransferInstruction = async (
  connection: Connection,
  sourceTokenAccountAddress: PublicKey,
  destinationAccountAddress: PublicKey,
  mintAddress: PublicKey,
  amount: number,
  signer: Keypair
) => {
  const instructions = [];
  let destinationTokenAddress = destinationAccountAddress;

  const destinationAccountInfo = await connection.getAccountInfo(
    destinationAccountAddress
  );

  if (!destinationAccountInfo) {
    return;
  }

  // If the address is not a token address
  if (
    destinationAccountInfo &&
    destinationAccountInfo.owner !== TOKEN_PROGRAM_ID
  ) {
    // Fetch existing token account
    const accounts = await connection.getTokenAccountsByOwner(
      destinationAccountAddress,
      { mint: mintAddress }
    );
    if (accounts.value.length > 0) {
      const [account] = accounts.value;
      destinationTokenAddress = account.pubkey;
    } else {
      // Calculate associated token address
      const associatedTokenAccountAddress =
        await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mintAddress,
          destinationAccountAddress
        );

      // Add the instruction to create the account
      instructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mintAddress,
          associatedTokenAccountAddress,
          destinationAccountAddress,
          signer.publicKey
        )
      );

      destinationTokenAddress = associatedTokenAccountAddress;
    }
  }

  instructions.push(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      sourceTokenAccountAddress,
      destinationTokenAddress,
      signer.publicKey,
      [],
      amount
    )
  );

  return instructions;
};
