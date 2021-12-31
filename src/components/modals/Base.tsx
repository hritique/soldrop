import { ReactNode, useEffect } from 'react';
import styled from 'styled-components';

export default function ModalBase({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: any;
}) {
  const handleClick = () => {
    onClose();
  };

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keyup', keyHandler);

    return () => document.removeEventListener('keyup', keyHandler);
  }, [onClose]);

  return (
    <Overlay onClick={handleClick}>
      <Container onClick={(e) => e.stopPropagation()}>{children}</Container>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 2;
`;

const Container = styled.div`
  background-color: #0f0f13;
  padding: 2rem;
  border-radius: 8px;
`;

export const ActionsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 1.2rem;
`;

export const CancelButton = styled.button`
  border: none;
  outline: none;
  padding: 0.6rem 0.8rem;
  border-radius: 4px;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;

  span {
    background: ${(props) => props.theme.colors.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export const DoneButton = styled(CancelButton)`
  background: ${(props) => props.theme.colors.primary};
  color: inherit;
`;

export const ModalHead = styled.h1`
  padding: 1rem 0;
  margin-top: -2rem;
  border-bottom: 1px dashed #2c2c35;
  margin-bottom: 1.2rem;
  font-size: 1.4rem;
`;
