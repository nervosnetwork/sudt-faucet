import { CreateRcUdtInfoCellBuilder } from '@ckitjs/ckit';
import { SudtStaticInfo } from '@ckitjs/rc-lock';
import { Button, Form, Input } from 'antd';
import { useFormik } from 'formik';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useProvider, useRcSigner, useSendTransaction } from '../hooks';

const StyleWrapper = styled.div`
  padding: 20px 60px;
`;

const CreateToken: React.FC = () => {
  const history = useHistory();
  const { rcIdentity } = useRcSigner();
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const provider = useProvider();
  const formik = useFormik<SudtStaticInfo>({
    initialValues: {
      decimals: 0,
      maxSupply: '',
      name: '',
      description: '',
      symbol: '',
    },
    async onSubmit(val) {
      const builder = new CreateRcUdtInfoCellBuilder({ sudtInfo: val, rcIdentity }, provider);
      const unsigned = await builder.build();
      return sendTransaction(unsigned).then(goToTokenList);
    },

    validate() {
      // TODO
      //  - name: required
      //  - symbol: required
      //  - description: required
      //  - maxSupply: required, number, integer
      //  - decimals: required, large than maxSupply
    },
  });

  const goToTokenList = () => {
    history.push('/token-list');
  };

  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="Token Name">
          <Input name="name" onChange={formik.handleChange} value={formik.values.name} />
        </Form.Item>

        <Form.Item label="Token Symbol">
          <Input name="symbol" onChange={formik.handleChange} value={formik.values.symbol} />
        </Form.Item>
        <Form.Item label="Decimals">
          <Input name="decimals" onChange={formik.handleChange} value={formik.values.decimals} />
        </Form.Item>
        <Form.Item label="Max Supply">
          <Input name="maxSupply" onChange={formik.handleChange} value={formik.values.maxSupply} />
        </Form.Item>

        <Form.Item label="description">
          <Input.TextArea name="description" onChange={formik.handleChange} value={formik.values.description} />
        </Form.Item>

        <Form.Item>
          <Button onClick={() => formik.submitForm()} type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </StyleWrapper>
  );
};
export default CreateToken;
