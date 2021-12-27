import { PublicKey } from '@solana/web3.js';
import { FC, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { AppContext } from '../App';
import { addDecimalNumberStrings, getExplorerLink } from '../utils/functions';
import { Account, TransactionStatus } from '../utils/types';
import { ErrorBox, ProgressBox, SuccessBox } from './StatusBox';

const GridView: FC<{ accounts: Account[]; setAccounts: any }> = ({
  accounts = [],
  setAccounts,
}) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const { selectedToken } = useContext(AppContext);

  const updateAccount = (
    id: string,
    updatedAccount: {
      address: string;
      amount: string;
    }
  ) => {
    const accountIndexToBeUpdated = accounts.findIndex((a) => a.id === id);
    let updatedAccounts = [...accounts];

    if (accountIndexToBeUpdated !== -1) {
      let publicKey: Account['publicKey'];

      try {
        publicKey = {
          value: new PublicKey(updatedAccount.address.trim()),
          asString: new PublicKey(updatedAccount.address.trim()).toString(),
          isValid: true,
        };

        // TODO: Handle uninitialized accounts
      } catch (e) {
        publicKey = {
          isValid: false,
          asString: updatedAccount.address.trim(),
          value: undefined,
        };
      }

      updatedAccounts[accountIndexToBeUpdated] = {
        ...accounts[accountIndexToBeUpdated],
        publicKey,
        amount: updatedAccount.amount,
      };
    }

    setAccounts(updatedAccounts);
  };

  useEffect(() => {
    setTotalAmount(
      addDecimalNumberStrings(
        accounts.map((a) => a.amount),
        selectedToken && selectedToken.decimals
      )
    );
  }, [accounts, selectedToken]);

  return (
    <Table>
      <thead>
        <th className="sno">S.No.</th>
        <th className="address">Address</th>
        <th className="amount">Amount</th>
        <th className="status"></th>
      </thead>
      <tbody>
        {accounts.map((account, i) => {
          return (
            <tr key={account.id}>
              <td align="center" className="sno">
                {i + 1}
              </td>
              <td
                width="100%"
                className={
                  'address' + (!account.publicKey.isValid ? ' invalid' : '')
                }
                title={account.publicKey.isValid ? '' : 'Invalid Public Key'}
              >
                <input
                  type="text"
                  name="account-address"
                  value={account.publicKey.asString}
                  onChange={(e) => {
                    updateAccount(account.id, {
                      address: e.target.value,
                      amount: account.amount ? account.amount.toString() : '',
                    });
                  }}
                  placeholder={i === 0 ? 'Enter Public Key' : ''}
                />
              </td>
              <td className="amount">
                <input
                  type="text"
                  name="amount"
                  value={account.amount}
                  onChange={(e) => {
                    updateAccount(account.id, {
                      amount: e.target.value,
                      address: account.publicKey.asString,
                    });
                  }}
                  placeholder={i === 0 ? 'Enter Amount' : ''}
                />
              </td>
              <td className="status">
                {account.transaction.status === TransactionStatus.PROGRESS ? (
                  <ProgressBox>
                    <a
                      href={getExplorerLink(account.transaction.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit' }}
                    >
                      Pending...
                    </a>
                  </ProgressBox>
                ) : account.transaction.status ===
                  TransactionStatus.SUCCESSFUL ? (
                  <SuccessBox>
                    <a
                      href={getExplorerLink(account.transaction.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit' }}
                    >
                      Successful
                    </a>
                  </SuccessBox>
                ) : account.transaction.status === TransactionStatus.FAILED ? (
                  <ErrorBox>
                    <a
                      href={getExplorerLink(account.transaction.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit' }}
                    >
                      Successful
                    </a>
                  </ErrorBox>
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td align="center" className="sno">
            {accounts.length}
          </td>
          <td align="right" className="address">
            Total
          </td>
          <td align="left" className="amount">
            {totalAmount}
          </td>
        </tr>
      </tfoot>
    </Table>
  );
};

export default GridView;

const Table = styled.table`
  width: max-content;
  font-size: 14px;
  font-weight: 300;
  border-collapse: collapse;
  overflow-x: visible;

  tr {
    text-align: left;
  }

  .sno {
    width: 6rem;
  }

  .address {
    width: 32rem;
    text-align: left;

    &.invalid {
      color: red;
    }
  }

  .amount {
    width: 10rem;
    text-align: left;

    input {
      min-width: auto;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }
  }

  .status {
    background: none;
    border: none;
  }

  td,
  th {
    padding: 0.4rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: none;

    &:first-child {
      border-radius: 6px 0 0 6px;
      border-left: none;
    }

    &:nth-of-type(3) {
      border-radius: 0 6px 6px 0;
      border-right: none;
    }

    input {
      width: 100%;
      min-width: max-content;
      background-color: transparent;
      color: inherit;
      border: none;
      font-size: inherit;
      padding: 0.4rem 0;

      &:focus {
        border: none;
        outline: none;
        caret-color: white;

        &::placeholder {
          opacity: 0;
        }
      }
    }
  }

  th {
    background-color: #2c2c35;
    font-weight: 300;
  }

  td {
    background-color: #1e1e24;
  }

  thead th,
  tfoot td {
    padding: 0.8rem 1rem;
  }

  thead th {
    border-bottom: 0.2rem solid transparent;
  }

  tfoot td {
    background-color: #2c2c35;
    border-top: 0.2rem solid transparent;
  }

  tfoot .address {
    text-align: right;
  }
`;
