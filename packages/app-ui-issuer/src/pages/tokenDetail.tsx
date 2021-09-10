import { Button, Descriptions, Spin } from 'antd';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AssetAmount } from '../components/assetAmount';
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

  const goToIssue = () => {
    history.push(`/issue-token/${udtId}`);
  };
  const goToManagement = () => {
    history.push(`/token-management/${udtId}`);
  };

  return (
    <StyleWrapper>
      <div className="actions">
        <Button onClick={goToIssue}>Issue</Button>
        <Button onClick={goToManagement}>Management</Button>
      </div>
      {isLoading || !foundUdtInfo ? (
        <Spin />
      ) : (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Name">{foundUdtInfo.name}</Descriptions.Item>
          <Descriptions.Item label="Symbol">{foundUdtInfo.symbol}</Descriptions.Item>
          <Descriptions.Item label="Max supply">
            <AssetAmount
              amount={foundUdtInfo.maxSupply}
              decimals={foundUdtInfo.decimals}
              symbol={foundUdtInfo.symbol}
            />
          </Descriptions.Item>

          <Descriptions.Item label="Current supply">
            <AssetAmount
              amount={foundUdtInfo.currentSupply}
              decimals={foundUdtInfo.decimals}
              symbol={foundUdtInfo.symbol}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Decimals">{foundUdtInfo.decimals}</Descriptions.Item>
          <Descriptions.Item label="Description">{foundUdtInfo.description}</Descriptions.Item>
        </Descriptions>
      )}
    </StyleWrapper>
  );
};
export default TokenDetail;
