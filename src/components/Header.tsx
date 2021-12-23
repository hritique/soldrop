import { Cluster, PublicKey } from '@solana/web3.js';
import { useContext, useState } from 'react';
import styled from 'styled-components';
import { AppContext } from '../App';
import Logo from '../assets/img/logo.svg';
import { getAllTokensOwnedByUser, getConnection } from '../utils/functions';
import { shortenAddress } from '../utils/parser';

export default function Header() {
  const { setWallet, wallet, setSelectedToken } = useContext(AppContext);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    const connection = getConnection(
      process.env.REACT_APP_SOLANA_CLUSTER as Cluster
    );
    const wallet = window.solana;
    if (wallet && setWallet && setSelectedToken) {
      setIsConnecting(true);
      try {
        const response = await wallet.connect();
        const publicKey = new PublicKey(response.publicKey.toString());

        const balanceInLamports = await connection.getBalance(publicKey);

        const tokens = await getAllTokensOwnedByUser(connection, publicKey);

        setWallet({ ...wallet, publicKey, balanceInLamports, tokens });
        setSelectedToken(tokens[0]);
        setIsConnecting(false);
      } catch (error) {}
    }
  };

  const disconnectWallet = async () => {
    await wallet?.disconnect();
    setWallet && setWallet(undefined);
    setSelectedToken && setSelectedToken(undefined);
  };

  return (
    <Nav>
      <ContentContainer>
        <LogoContainer>
          <img src={Logo} alt="Soldrop Logo" />
        </LogoContainer>
        {wallet ? (
          <WalletContainer>
            <p className="address">
              {shortenAddress(wallet.publicKey?.toString())}
            </p>
            <Button onClick={disconnectWallet}>Disconnect Wallet</Button>
          </WalletContainer>
        ) : (
          <Button onClick={connectWallet}>
            {isConnecting ? 'Connecting...' : 'Connect Phantom'}
          </Button>
        )}
      </ContentContainer>
    </Nav>
  );
}

const Nav = styled.nav`
  width: 100%;
  background-color: #1e1e24;
`;

const ContentContainer = styled.div`
  max-width: 48rem;
  margin: auto;
  display: flex;
  padding: 1rem 0;
  justify-content: center;
  align-items: center;
  justify-content: space-between;
`;

const LogoContainer = styled.a`
  height: 100%;

  img {
    height: 100%;
  }
`;

const WalletContainer = styled.div`
  display: flex;
  align-items: center;

  .address {
    margin-right: 0.5rem;
    background: #2c2c35;
    padding: 0.5rem 0.8rem;
    border-radius: 4px;
  }
`;

const Button = styled.button`
  outline: none;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 0.8rem;
  background-color: #fff;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
`;
