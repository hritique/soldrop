import { PublicKey, Transaction } from '@solana/web3.js';

export interface SolanaToken {
  address: PublicKey;
  mint: PublicKey;
  name?: string;
  logo?: string;
  tokenAmount?: number;
  decimals: number;
}

export interface Solana {
  isPhantom?: boolean;
  publicKey: PublicKey;
  balanceInLamports: number;
  isConnected: boolean;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  connect(): Promise<any>;
  disconnect(): Promise<void>;
  tokens: SolanaToken[];
}

export enum TransactionStatus {
  IDLE = 'IDLE',
  PROGRESS = 'PROGRESS',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
}

interface ValidPublicKey {
  isValid: true;
  value: PublicKey;
  asString: string;
}

interface InvalidPublicKey {
  isValid: false;
  value: undefined;
  asString: string;
}

interface IdleTransaction {
  status: TransactionStatus.IDLE;
  hash?: undefined;
}

interface ProgressTransaction {
  status: Exclude<TransactionStatus, TransactionStatus.IDLE>;
  hash: string;
}

export interface Account {
  id: string;
  publicKey: ValidPublicKey | InvalidPublicKey;
  amount: string;
  transaction: IdleTransaction | ProgressTransaction;
}
