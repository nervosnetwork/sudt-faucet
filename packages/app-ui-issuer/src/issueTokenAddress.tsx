import { Form, Input, Button } from 'antd';
import React from 'react';
import styled from 'styled-components';

const StyleWrapper = styled.div`
  padding: 20px;
  .actions {
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
    button + button {
      margin-top: 10px;
    }
  }
`;

const IssueTokenAddress: React.FC = () => {
  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please input your address!' }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: 'Please input your token amount!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Issue
          </Button>
        </Form.Item>
      </Form>
    </StyleWrapper>
  );
};
export default IssueTokenAddress;
