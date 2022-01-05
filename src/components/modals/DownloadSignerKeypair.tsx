import { Keypair } from '@solana/web3.js';
import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { AppContext } from '../../App';
import { downloadFile } from '../../utils/functions';
import ModalBase, {
  ActionsContainer,
  CancelButton,
  DoneButton,
  ModalHead,
} from './Base';

export default function DownloadSignerKeypair({
  onClose,
  onProceed,
}: {
  onClose: () => void;
  onProceed: () => any;
}) {
  const { temporarySignerAccount, setTemporarySignerAccount } =
    useContext(AppContext);

  useEffect(() => {
    const signerAccount = new Keypair();
    setTemporarySignerAccount && setTemporarySignerAccount(signerAccount);
  }, [setTemporarySignerAccount]);

  const handleDownload = async () => {
    const fileData = `Private Key: [${temporarySignerAccount?.secretKey.toString()}]
Public Key: ${temporarySignerAccount?.publicKey.toString()}
    `;
    downloadFile(fileData, 'Keypair.SECRET.txt');
  };

  return (
    <ModalBase onClose={onClose}>
      <ModalHead>Important!</ModalHead>
      <Container>
        <p>
          For your convenience, the total amount of token will be transferred to
          this temporary account and this account will then be used to sign all
          the transactions.
        </p>
        <p>
          This way you won't have to sign multiple transactions. You just have
          to sign one transaction to transfer the total amount to this account.
        </p>
        <p>
          For safety you should download and save this keypair to a safe
          location in case something goes wrong, so you can retrieve your tokens
          from this account anytime.
        </p>
        <br />
        <DownloadButton onClick={handleDownload}>Download File</DownloadButton>
        <ActionsContainer>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <DoneButton onClick={onProceed}>Proceed</DoneButton>
        </ActionsContainer>
      </Container>
    </ModalBase>
  );
}

const Container = styled.div`
  max-width: 30rem;

  p {
    line-height: 1.5;
  }
`;

const DownloadButton = styled.button`
  background: none;
  color: #f76262;
  border: none;
  font-size: inherit;
  text-decoration: underline;
  cursor: pointer;
`;
