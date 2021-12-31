import React, { useState } from 'react';
import styled from 'styled-components';
import { AppContext } from '../App';
import { parseCsv } from '../utils/parser';
import GridView from './GridView';
import CSVTextModal from './modals/CSVText';
import UploadCsv from './modals/UploadCsv';

export default function AddressTable() {
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);
  const { accounts, setAccounts } = React.useContext(AppContext);
  const [showCSVTextModal, setShowCSVTextModal] = useState(false);

  const handleCsvData = (rawData: string) => {
    if (setAccounts) {
      const parsedData = parseCsv(rawData);
      setAccounts(parsedData);
    }
  };

  return (
    <Container>
      <Header>
        <h2>List of Accounts</h2>
      </Header>

      <GridView accounts={accounts} setAccounts={setAccounts} />

      <Footer>
        <ShowCsvEditorButton onClick={() => setShowCSVTextModal(true)}>
          CSV Editor
        </ShowCsvEditorButton>
        <UploadButton onClick={() => setIsDropzoneOpen(true)}>
          Upload CSV File
        </UploadButton>
      </Footer>

      {isDropzoneOpen ? (
        <UploadCsv
          onClose={() => setIsDropzoneOpen(false)}
          onUploaded={handleCsvData}
        />
      ) : null}

      {showCSVTextModal ? (
        <CSVTextModal
          accounts={accounts}
          setAccounts={setAccounts}
          onClose={() => setShowCSVTextModal(false)}
        />
      ) : null}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    font-size: 1rem;
    font-weight: 500;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1rem;

  a {
    font-size: 1rem;
    font-weight: 500;
    color: ${(props) => props.theme.colors.primary};
    text-underline-offset: 0.2rem;
  }
`;

const UploadButton = styled.button`
  border: none;
  outline: none;
  padding: 0.6rem 0.8rem;
  border-radius: 4px;
  background: ${(props) => props.theme.colors.primary};
  color: inherit;
  cursor: pointer;
`;

const ShowCsvEditorButton = styled.button`
  padding: 1rem;
  border: none;
  outline: none;
  background: none;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${(props) => props.theme.colors.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: underline;
  text-decoration-color: #f76262;
  text-underline-offset: 0.2rem;
  cursor: pointer;
`;
