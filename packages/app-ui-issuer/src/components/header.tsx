import React from 'react';
import styled from 'styled-components';
import { WalletContainer } from '../containers';
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
  const wallet = WalletContainer.useContainer();

  return (
    <HeaderWrapper>
      <div>{props.title}</div>
      {wallet.stage === 'readyToSign' && (
        <div>
          <Address address={wallet.address} />
        </div>
      )}
    </HeaderWrapper>
  );
};

export default Header;
