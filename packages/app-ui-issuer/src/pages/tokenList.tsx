import { RightOutlined } from '@ant-design/icons';
import { List, Typography, Button } from 'antd';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { token } from '../types';

const StyleWrapper = styled.div`
  height: calc(100% - 40px);
  padding: 20px;
  .actions {
    padding: 10px 0;
    display: flex;
    align-items: center;
  }
`;

const tokenList: Array<token> = [
  {
    id: '1',
    name: 'token1',
    symbol: 'symbol1',
    unissued: 'unissued1',
    issued: 'issued1',
    decimals: 1,
    description: 'description1',
  },
  {
    id: '2',
    name: 'token2',
    symbol: 'symbol2',
    unissued: 'unissued2',
    issued: 'issued2',
    decimals: 2,
    description: 'description2',
  },
  {
    id: '3',
    name: 'token3',
    symbol: 'symbol3',
    unissued: 'unissued3',
    issued: 'issued3',
    decimals: 3,
    description: 'description3',
  },
];

const Login: React.FC = () => {
  const history = useHistory();
  const goToCreateToken = () => {
    history.push('/create-token');
  };

  const goToTokenDetail = (item: token) => {
    history.push(`/token-detail/${item.id}`);
  };

  return (
    <StyleWrapper>
      <div className="actions">
        <Button onClick={goToCreateToken} type="primary">
          Create A Token
        </Button>
      </div>
      <List
        bordered
        dataSource={tokenList}
        renderItem={(item) => (
          <List.Item onClick={() => goToTokenDetail(item)}>
            <Typography.Text>{item.name}</Typography.Text>
            <RightOutlined />
          </List.Item>
        )}
      />
    </StyleWrapper>
  );
};
export default Login;
