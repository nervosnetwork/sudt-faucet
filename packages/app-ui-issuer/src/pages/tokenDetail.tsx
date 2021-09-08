import { Button, Spin, Typography } from 'antd';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useListRcSupplyLockUdtQuery } from '../hooks/';

const StyleWrapper = styled.div`
  padding: 20px;
  .actions {
    padding-bottom: 10px;
    button + button {
      margin-left: 10px;
    }
  }
`;

const TokenDetail: React.FC = () => {
  const history = useHistory();
  const { udtId } = useParams<{ udtId: string }>();
  const { data: udts, isLoading } = useListRcSupplyLockUdtQuery(udtId);
  const foundUdtInfo = udts?.[0];

  const goToIssus = () => {
    history.push(`/issue-token/${udtId}`);
  };
  const goToManagement = () => {
    history.push(`/token-management/${udtId}`);
  };
  return (
    <StyleWrapper>
      <div className="actions">
        <Button onClick={goToIssus}>Issue</Button>
        <Button onClick={goToManagement}>Management</Button>
      </div>
      {isLoading || !foundUdtInfo ? (
        <Spin />
      ) : (
        <>
          <Typography>Name: {foundUdtInfo.name}</Typography>
          <Typography>Symbol: {foundUdtInfo.symbol}</Typography>
          <Typography>Unissued: {foundUdtInfo.maxSupply}</Typography>
          <Typography>Issued: {foundUdtInfo.currentSupply}</Typography>
          <Typography>Decimals: {foundUdtInfo.decimals}</Typography>
          <Typography>Description: {foundUdtInfo.description}</Typography>
        </>
      )}
    </StyleWrapper>
  );
};
export default TokenDetail;
