import { Button } from 'antd';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ClaimContainer } from '../ClaimContainer';

const LoginWrapper = styled.div`
  height: calc(100% - 40px);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Login: React.FC = () => {
  const { wallet, address } = ClaimContainer.useContainer();
  const history = useHistory();

  useEffect(() => {
    if (address) history.replace('/claim');
  }, [address, history]);

  return (
    <LoginWrapper>
      <Button onClick={() => wallet && wallet.connect()}>Connect To UniPass</Button>
    </LoginWrapper>
  );
};
export default Login;
