import { createLoginMessage } from '@sudt-faucet/commons';
import { Button } from 'antd';
import React from 'react';
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
  const handleLogin = async () => {
    const result = await createLoginMessage(`Login:${Date.now}`);
    const response = await client.request('login', { address: result });
    console.log(response);
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
