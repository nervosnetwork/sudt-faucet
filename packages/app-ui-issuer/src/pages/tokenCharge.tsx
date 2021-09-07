import { Form, Input, Button } from 'antd';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const StyleWrapper = styled.div`
  padding: 20px 60px;
`;

const TokenCharge: React.FC = () => {
  const history = useHistory();
  const goToTokenList = () => {
    history.push('/token-list');
  };
  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="Capaticy(CKB)" name="capaticy" rules={[{ required: true, message: 'Please input capaticy' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Amount(Ins)" name="amount" rules={[{ required: true, message: 'Please input amount!' }]}>
          <Input />
        </Form.Item>

        <Form.Item>
          <Button onClick={goToTokenList} type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </StyleWrapper>
  );
};
export default TokenCharge;
