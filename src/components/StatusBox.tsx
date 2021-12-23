import styled from 'styled-components';

const BaseStatusBox = styled.div`
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: inherit;
`;

export const ErrorBox = styled(BaseStatusBox)`
  border: 1px solid rgba(219, 48, 49, 0.5);
  background-color: rgba(253, 68, 56, 0.2);
`;

export const ProgressBox = styled(BaseStatusBox)`
  background-color: rgba(123, 97, 255, 0.2);
  border: 1px solid #7b61ff;
`;

export const SuccessBox = styled(BaseStatusBox)`
  background-color: rgba(36, 202, 73, 0.2);
  border: 1px solid #24ca49;
`;
