import { Button } from 'antd';
import React from 'react';
import styled from 'styled-components';

const LoginWrapper = styled.div`
  height: calc(100% - 40px);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Login: React.FC = () => {
  return (
    <LoginWrapper>
      <Button>Connect To UniPass</Button>
    </LoginWrapper>
  );
};
export default Login;
