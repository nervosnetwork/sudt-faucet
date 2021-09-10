import { RightOutlined } from '@ant-design/icons';
import { Button, List, Typography } from 'antd';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useListRcSupplyLockUdtQuery } from '../hooks';

const StyleWrapper = styled.div`
  height: calc(100% - 40px);
  padding: 20px;
  .actions {
    padding: 10px 0;
    display: flex;
    align-items: center;
  }
`;

const TokenList: React.FC = () => {
  const history = useHistory();

  const { data, isLoading } = useListRcSupplyLockUdtQuery();
  const goToCreateToken = () => {
    history.push('/create-token');
  };

  const goToTokenDetail = (id: string) => {
    history.push(`/token-detail/${id}`);
  };

  return (
    <StyleWrapper>
      <div className="actions">
        <Button onClick={goToCreateToken} type="primary">
          Create A Token
        </Button>
      </div>
      <List
        loading={isLoading}
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item onClick={() => goToTokenDetail(item.udtId)}>
            <Typography.Text>{item.name}</Typography.Text>
            <RightOutlined />
          </List.Item>
        )}
      />
    </StyleWrapper>
  );
};
export default TokenList;
