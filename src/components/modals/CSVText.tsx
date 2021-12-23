import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import styled from 'styled-components';
import { parseAccountsToCsv, parseCsv } from '../../utils/parser';
import { Account } from '../../utils/types';
import ModalBase, {
  ActionsContainer,
  CancelButton,
  DoneButton,
  ModalHead,
} from './Base';

const CSVText: FC<{
  accounts?: Account[];
  setAccounts: Dispatch<SetStateAction<Account[]>> | undefined;
  onClose: () => void;
}> = ({ accounts = [], setAccounts, onClose }) => {
  const [parsedAccounts, setParsedAccounts] = useState<string>('');

  const handleClose = () => {
    onClose();
  };

  const handleDone = () => {
    const parsed = parseCsv(parsedAccounts);
    setAccounts && setAccounts(parsed);
    handleClose();
  };

  useEffect(() => {
    const parsed = parseAccountsToCsv(accounts);
    setParsedAccounts(parsed);
  }, [setParsedAccounts, accounts]);

  const handleChange:
    | React.ChangeEventHandler<HTMLTextAreaElement>
    | undefined = (e) => {
    setParsedAccounts(e.target.value);
  };

  return (
    <ModalBase onClose={handleClose}>
      <ModalHead>CSV Editor</ModalHead>
      <Container>
        <Textarea value={parsedAccounts} onChange={handleChange} autoFocus />
      </Container>
      <ActionsContainer>
        <CancelButton onClick={handleClose}>Go Back</CancelButton>
        <DoneButton onClick={handleDone}>Done</DoneButton>
      </ActionsContainer>
    </ModalBase>
  );
};

export default CSVText;

const Container = styled.div``;

const Textarea = styled.textarea`
  height: 20rem;
  width: 30rem;
  padding: 1rem;
  background: #2c2c35;
  border: none;
  border-radius: 8px;
  color: inherit;
`;
