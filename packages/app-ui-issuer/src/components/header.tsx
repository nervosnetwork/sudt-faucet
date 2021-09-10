import { LeftOutlined } from '@ant-design/icons';
import React from 'react';
import { useHistory } from 'react-router-dom';
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
  align-items: center;
  .icon-container {
    width: 120px;
  }
  .title {
    cursor: pointer;
  }
`;

const Header: React.FC<IProps> = (props: IProps) => {
  const wallet = WalletContainer.useContainer();
  const history = useHistory();
  const goLogin = () => {
    history.push('/login');
  };

  const goBack = () => {
    history.go(-1);
  };

  return (
    <HeaderWrapper>
      <div className="icon-container">
        <LeftOutlined onClick={goBack} />
      </div>
      <div className="title" onClick={goLogin}>
        {props.title}
      </div>
      {wallet.stage === 'readyToSign' && (
        <div>
          <Address address={wallet.address} />
        </div>
      )}
    </HeaderWrapper>
  );
};

export default Header;
