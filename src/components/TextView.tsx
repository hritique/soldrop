import { FC } from 'react';
import styled from 'styled-components';
import { Account, TransactionStatus } from '../utils/types';

const TextView: FC<{ addresses?: Account[] }> = ({ addresses = [] }) => {
  return (
    <Container>
      {addresses.map((address, i) => (
        <EachLine
          key={address.id}
          address={address?.publicKey.asString || ''}
          rowNumber={i + 1}
          transactionStatus={address.transactionStatus}
        />
      ))}
      <Footer>
        <div className="qty">{addresses.length}</div>
        <div className="total-container">
          <div className="total">Total</div>
          <div className="total-value"></div>
        </div>
      </Footer>
    </Container>
  );
};

const EachLine: FC<{
  rowNumber: number;
  address: string;
  transactionStatus: TransactionStatus;
}> = ({ address, rowNumber, transactionStatus = TransactionStatus.IDLE }) => {
  return (
    <LineContainer
      className={
        transactionStatus === TransactionStatus.SUCCESSFUL
          ? 'successful'
          : transactionStatus === TransactionStatus.FAILED
          ? 'failed'
          : transactionStatus === TransactionStatus.PROGRESS
          ? 'progress'
          : ''
      }
    >
      <RowNumber>{rowNumber}</RowNumber>
      <AddressText>{address}</AddressText>
    </LineContainer>
  );
};

export default TextView;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1e1e24;
  border-radius: 8px;
  overflow: hidden;
`;

const LineContainer = styled.div`
  width: 100%;
  height: 2rem;
  display: flex;

  &.progress {
    background-color: rgba(123, 97, 255, 0.2);
  }

  &.successful {
    background-color: rgba(36, 202, 73, 0.2);
  }

  &.failed {
    background-color: rgba(253, 68, 56, 0.2);
  }

  &:note(:last-child) {
    padding-top: 2rem;
  }
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  background-color: #2c2c35;

  div {
    display: flex;
    align-items: center;
  }

  .qty {
    width: 4rem;
    height: 100%;
    border-right: 2px solid #16161e;
    justify-content: center;
    padding: 0 1rem;
  }

  .total-container {
    width: 100%;
    height: 100%;
  }

  .total {
    width: 6rem;
    height: 100%;
    text-align: right;
    padding: 0rem 1rem;
  }

  .total-value {
    padding: 0.7rem 1rem;
  }
`;

const RowNumber = styled.div`
  width: 4rem;
  height: 100%;
  border-right: 2px solid #16161e;
  padding: 0.6rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddressText = styled.div`
  height: 100%;
  width: 100%;
  color: white;
  padding: 0.6rem 1.2rem;
  display: flex;
  align-items: center;
`;
