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

const IssueTokenMail: React.FC = () => {
  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="e-mail" name="e-mail" rules={[{ required: true, message: 'Please input your e-mail!' }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: 'Please input your token amount!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Exoired Time"
          name="expiredTime"
          rules={[{ required: true, message: 'Please input your token expired time!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Send An Claimable E-mail
          </Button>
        </Form.Item>
      </Form>
    </StyleWrapper>
  );
};
export default IssueTokenMail;
