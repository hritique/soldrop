import { useContext } from 'react';
import styled from 'styled-components';
import { AppContext } from '../App';
import { SolanaToken } from '../utils/types';
import Select, { Option } from './Select';

export default function TokenInput({ tokens }: { tokens: SolanaToken[] }) {
  const { selectedToken, setSelectedToken } = useContext(AppContext);

  return (
    <Container>
      <Label>Token</Label>
      <Select
        key={selectedToken?.address.toString()}
        label={
          selectedToken ? (
            <OptionChild>
              {selectedToken.logo && (
                <img src={selectedToken.logo} alt={selectedToken.name} />
              )}
              {selectedToken && selectedToken.name}
            </OptionChild>
          ) : (
            <>Select Token</>
          )
        }
        disabled={!(tokens?.length > 0)}
      >
        {tokens.map((token, i: number) => (
          <Option
            key={token.mint.toString()}
            onClick={() =>
              setSelectedToken &&
              setSelectedToken(tokens.find((t) => t.mint === token.mint))
            }
          >
            <OptionChild>
              {token.logo && <img src={token.logo} alt={token.name} />}
              {token.name}
            </OptionChild>
          </Option>
        ))}
      </Select>
      {selectedToken && (
        <span className="amount">Balance: {selectedToken.tokenAmount}</span>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  padding: 1rem;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  z-index: 1;

  .amount {
    font-size: 0.9rem;
    font-weight: 300;
    margin-top: 0.6rem;
  }
`;

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 12px;
`;

const OptionChild = styled.span`
  display: flex;
  align-items: center;

  img {
    width: 1.2rem;
    margin-right: 0.5rem;
  }
`;
