import React from 'react';
import styled from 'styled-components';
import { ClaimContainer } from '../ClaimContainer';
import { Address } from './address';

interface IProps {
  title?: string;
}

const HeaderWrapper = styled.div`
  height: 40px;
  line-height: 40px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
`;

const Header: React.FC<IProps> = (props: IProps) => {
  const { address } = ClaimContainer.useContainer();

  return (
    <HeaderWrapper>
      <div>{props.title}</div>
      {address && (
        <div>
          <Address address={address} />
        </div>
      )}
    </HeaderWrapper>
  );
};

export default Header;
