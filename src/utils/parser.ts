import { PublicKey } from '@solana/web3.js';
import { Account } from './types';
import { TransactionStatus } from './types';
import { v4 as uuid } from 'uuid';
import CSV from 'papaparse';

export const parseCsv = (rawData: string): Account[] => {
  const parsed = CSV.parse<string>(rawData, { skipEmptyLines: true });
  const parsedAccounts = parsed.data.slice(1).map((row) => {
    let publicKey: Account['publicKey'];

    try {
      publicKey = {
        value: new PublicKey(row[0].trim()),
        asString: new PublicKey(row[0].trim()).toString(),
        isValid: true,
      };

      // TODO: Handle uninitialized accounts
    } catch (e) {
      publicKey = { isValid: false, asString: row[0].trim(), value: undefined };
    }
    return {
      id: uuid(),
      publicKey,
      amount: row[1].trim(),
      transactionStatus: TransactionStatus.IDLE,
    };
  });

  return parsedAccounts;
};

export const parseAccountsToCsv = (accounts: Account[]) => {
  let csv = accounts
    .map((account) => {
      if (account.publicKey.asString !== '') {
        return [account.publicKey.asString, account.amount].join(',');
      } else {
        return null;
      }
    })
    .filter((a) => a)
    .join('\n');

  csv = `Addresses,Amount\n${csv}`;

  return csv;
};

export const shortenAddress = (address: string) => {
  return address.slice(0, 5) + '...' + address.slice(address.length - 5);
};
