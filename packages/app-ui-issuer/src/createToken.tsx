import { Form, Input, Button } from 'antd';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const StyleWrapper = styled.div`
  padding: 20px 60px;
`;

const CreateToken: React.FC = () => {
  const history = useHistory();
  const goToTokenList = () => {
    history.push('/token-list');
  };
  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item
          label="Token Name"
          name="tokenName"
          rules={[{ required: true, message: 'Please input your token name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Token Symbol"
          name="tokenSymbol"
          rules={[{ required: true, message: 'Please input your token symbol!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Decimals"
          name="decimals"
          rules={[{ required: true, message: 'Please input your decimals!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Max Supply"
          name="maxSupply"
          rules={[{ required: true, message: 'Please input your max supply!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="desciption" name="desciption">
          <Input.TextArea />
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
export default CreateToken;
