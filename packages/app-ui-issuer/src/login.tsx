import { Button } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

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
  return (
    <LoginWrapper>
      <Link to="/token-list" className="login">
        <Button className="login-btn" type="primary">
          Connect To MetaMask
        </Button>
      </Link>
    </LoginWrapper>
  );
};
export default Login;
