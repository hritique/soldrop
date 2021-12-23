import { FC, HTMLProps, ReactElement, useRef, useState } from 'react';
import styled from 'styled-components';
import Chevron from '../assets/img/chevron.svg';
import useOutsideClick from '../hooks/useOnOutsideClick';

const Select: FC<{
  label?: ReactElement;
  disabled: boolean;
}> = ({ children, label = 'Select Token', disabled = false }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick([dropdownRef], () => setShowDropdown(false));

  return (
    <SelectContainer
      onClick={() => !disabled && setShowDropdown((s) => !s)}
      ref={dropdownRef}
      disabled={disabled}
      className={showDropdown ? 'open' : 'close'}
    >
      {label}

      {showDropdown ? <DropdownContainer children={children} /> : null}

      <ActionContainer>
        <img
          src={Chevron}
          className="arrow"
          alt="Dropdown Arrow"
          onClick={() => setShowDropdown((s) => !s)}
        />
      </ActionContainer>
    </SelectContainer>
  );
};

export const Option: FC<HTMLProps<HTMLDivElement>> = ({
  children,
  onClick,
}) => {
  return <OptionContainer children={children} onClick={onClick} />;
};

const SelectContainer = styled.div<{ disabled: boolean }>`
  width: 100%;
  position: relative;
  padding: 0.8rem;
  background-color: #2c2c35;
  border-radius: 4px 4px 0 0;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  &.close {
    border-radius: 4px;
  }
`;

const ActionContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0.8rem;

  .arrow,
  .cancel {
    cursor: pointer;
  }

  .cancel {
    width: 1.2rem;
    margin-left: 0.8rem;

    :hover {
      color: ${(props) => props.theme.colors.primary};
    }

    transition: color 0.2s;
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  width: 100%;
  height: max-content;
  left: 0;
  top: 100%;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  border-top: 1px solid #444;
`;

const OptionContainer = styled.div`
  height: 100%;
  background-color: #2c2c35;
  color: white;
  display: flex;
  align-items: center;
  padding: 0.8rem;
  cursor: pointer;

  &:hover {
    background-color: #40404a;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #444;
  }
`;

export default Select;
