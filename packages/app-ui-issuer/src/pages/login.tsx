import { createLoginMessage } from '@sudt-faucet/commons';
import { Button } from 'antd';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import client from '../configs/client';

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

const Login: React.FC = () => {
  const history = useHistory();
  const goToTokenList = () => {
    history.push('/token-list');
  };
  const handleLogin = async () => {
    const message = `Login:${Date.now()}`;
    const { signature, address } = await createLoginMessage(message);
    const response = await client.request('login', { address, message, sig: signature });
    localStorage.setItem('authorization', response.jwt);
    goToTokenList();
  };

  return (
    <LoginWrapper>
      <Button className="login-btn" type="primary" onClick={handleLogin}>
        Connect To MetaMask
      </Button>
    </LoginWrapper>
  );
};
export default Login;
