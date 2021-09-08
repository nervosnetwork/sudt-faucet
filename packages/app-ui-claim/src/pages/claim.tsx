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
  .content {
  }
  .content-text {
    padding: 20px;
    line-height: 20px;
    margin-bottom: 30px;
  }
`;
const Claim: React.FC = () => {
  return (
    <Wrapper>
      <Typography className="content-text">
        A claim invitation can only be claimed once, are you sure you want to claim to ckb1qqq.... .qqq?
      </Typography>
      <Button>Claim 5 Ins</Button>
    </Wrapper>
  );
};
export default Claim;
