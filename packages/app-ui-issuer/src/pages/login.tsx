import { createLoginMessage } from '@sudt-faucet/commons';
import { Button, Spin } from 'antd';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import client from '../configs/client';
import { WalletContainer } from '../containers';

const LoginWrapper = styled.div`
  height: calc(90% - 40px);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-btn {
    height: 40px;
    width: 250px;
  }
`;

const ConnectButton: React.FC = () => {
  const wallet = WalletContainer.useContainer();

  if (wallet.stage === 'uninitialized') {
    return <Spin tip="App is initialing..." />;
  }

  if (wallet.stage === 'readyToConnect') {
    return (
      <Button type="primary" onClick={() => wallet.connect()}>
        Connect to MetaMask
      </Button>
    );
  }

  return null;
};

const Login: React.FC = () => {
  const wallet = WalletContainer.useContainer();

  const history = useHistory();
  const goToTokenList = () => {
    history.push('/token-list');
  };
  const handleLogin = async () => {
    // TODO remove me when server ready
    if (0) {
      const message = `Login:${Date.now()}`;
      const { signature, address } = await createLoginMessage(message);
      const response = await client.request('login', { address, message, sig: signature });
      localStorage.setItem('authorization', response.jwt);
    }

    goToTokenList();
  };

  return (
    <LoginWrapper>
      {wallet.stage !== 'readyToSign' ? (
        <ConnectButton />
      ) : (
        <Button className="login-btn" type="primary" onClick={handleLogin}>
          Login
        </Button>
      )}
    </LoginWrapper>
  );
};
export default Login;
