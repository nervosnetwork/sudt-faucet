import { Typography, Button } from 'antd';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { token } from '../types';

const StyleWrapper = styled.div`
  padding: 20px;
  .actions {
    padding-bottom: 10px;
    button + button {
      margin-left: 10px;
    }
  }
`;

const tokenDetail: token = {
  id: '1',
  name: 'token1',
  symbol: 'symbol1',
  unissued: 'unissued1',
  issued: 'issued1',
  decimals: 1,
  description: 'description1',
};

const TokenDetail: React.FC = () => {
  const history = useHistory();
  const goToIssus = () => {
    history.push('/issue-token');
  };
  const goToManagement = () => {
    history.push('/token-management');
  };
  return (
    <StyleWrapper>
      <div className="actions">
        <Button onClick={goToIssus}>Issue</Button>
        <Button onClick={goToManagement}>Management</Button>
      </div>
      <Typography>Name: {tokenDetail.name}</Typography>
      <Typography>Symbol: {tokenDetail.symbol}</Typography>
      <Typography>Unissued: {tokenDetail.unissued}</Typography>
      <Typography>Issued: {tokenDetail.issued}</Typography>
      <Typography>Decimals: {tokenDetail.decimals}</Typography>
      <Typography>Description: {tokenDetail.description}</Typography>
    </StyleWrapper>
  );
};
export default TokenDetail;
