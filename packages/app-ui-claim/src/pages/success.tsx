import { Button, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: calc(90% - 40px);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .content-header {
    font-size: 28px;
  }
  .content-text {
    padding: 20px;
    line-height: 20px;
    margin-bottom: 30px;
  }
`;
const Success: React.FC = () => {
  return (
    <Wrapper>
      <Typography className="content-header">Congratulation</Typography>
      <Typography className="content-text">Successfully claim 5 ins, go to my wallet to see</Typography>
      <Button>To My Wallet</Button>
    </Wrapper>
  );
};
export default Success;
