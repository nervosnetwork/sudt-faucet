import { MintRcUdtBuilder } from '@ckitjs/ckit';
import { Button, Form, Input } from 'antd';
import { useFormik } from 'formik';
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useProvider, useRcSigner, useSendTransaction } from '../hooks';

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
  const { udtId } = useParams<{ udtId: string }>();
  const provider = useProvider();
  const { rcIdentity } = useRcSigner();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  const formik = useFormik<{ address: string; amount: string }>({
    async onSubmit(val) {
      const builder = new MintRcUdtBuilder(
        {
          udtId,
          rcIdentity,
          // TODO impl createOrFind
          recipients: [
            {
              recipient: val.address,
              amount: val.amount,
              capacityPolicy: 'createCell',
              additionalCapacity: '100000000',
            },
          ],
        },
        provider,
      );

      const unsigned = await builder.build();
      return sendTransaction(unsigned);
    },
    initialValues: {
      amount: '',
      address: '',
    },
  });

  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="Address">
          <Input name="address" onChange={formik.handleChange} value={formik.values.address} />
        </Form.Item>

        <Form.Item label="Amount">
          <Input name="amount" onChange={formik.handleChange} value={formik.values.amount} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => formik.submitForm()}>
            Issue
          </Button>
        </Form.Item>
      </Form>
    </StyleWrapper>
  );
};
export default IssueTokenAddress;
