import { MintRcUdtBuilder } from '@ckitjs/ckit';
import { Form, Input, Button, Typography, message } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import client from '../configs/client';
import { useListRcSupplyLockUdtQuery, useProvider, useRcSigner, useSendTransaction } from '../hooks';

const StyleWrapper = styled.div`
  padding: 20px 60px;
`;

interface FormValues {
  capacity: string;
  amount: string;
}

interface FormError {
  capacity?: string;
  amount?: string;
}

const TokenCharge: React.FC = () => {
  const history = useHistory();
  const provider = useProvider();
  const { udtId } = useParams<{ udtId: string }>();
  const { data: udts } = useListRcSupplyLockUdtQuery(udtId);
  const { rcIdentity } = useRcSigner();
  const { mutateAsync: sendTransaction, isLoading } = useSendTransaction();

  const [chargeAddress, setChargeAddress] = useState<string>();

  const [ckbAmount, setCkbAmount] = useState('0');
  const [sudtAmount, setSudtAmount] = useState('0');

  useEffect(() => {
    void client.get_claimable_account_address().then(setChargeAddress);
  }, []);
  const foundUdtInfo = udts?.[0];
  const validate = (values: FormValues) => {
    if (!foundUdtInfo) return;
    const errors: FormError = {};
    if (!values.capacity) {
      errors.capacity = 'Capacity is Required';
    }
    const leftAmount = BigInt(foundUdtInfo.maxSupply) - BigInt(foundUdtInfo.currentSupply);
    if (!values.amount) {
      errors.amount = 'Capacity is Required';
    } else if (BigInt(values.amount) >= leftAmount) {
      errors.amount = `Must be less than or equal to ${leftAmount}`;
    }
    return errors;
  };

  function charge() {
    if (!chargeAddress) {
      return Promise.reject('Charge address is not loaded');
    }
    return new MintRcUdtBuilder(
      {
        udtId,
        rcIdentity,
        recipients: [
          {
            recipient: chargeAddress,
            amount: sudtAmount,
            //TODO findOrCreate
            capacityPolicy: 'createCell',
            additionalCapacity: ckbAmount,
          },
        ],
      },
      provider,
    )
      .build()
      .then(sendTransaction);
  }

  const initialValues: FormValues = {
    capacity: '',
    amount: '',
  };

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: (values: FormValues) => {
      history.push('/token-list');
      charge()
        .then(() => {
          history.push('/token-list');
        })
        .catch((e) => {
          void message.error(e);
        });
    },
  });

  if (!chargeAddress) return null;
  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="to">
          <div>{chargeAddress}</div>
        </Form.Item>
        <Form.Item label="Capacity(CKB)" name="capacity">
          <Input
            {...formik.getFieldProps('capacity')}
            value={ckbAmount}
            onChange={(e) => setCkbAmount(e.target.value)}
          />
          <Typography.Text type="danger">{formik.errors.capacity}</Typography.Text>
        </Form.Item>

        <Form.Item label="Amount(Ins)" name="amount">
          <Input
            {...formik.getFieldProps('amount')}
            value={sudtAmount}
            onChange={(e) => setSudtAmount(e.target.value)}
          />
          <Typography.Text type="danger">{formik.errors.amount}</Typography.Text>
        </Form.Item>

        <Form.Item>
          <Button loading={isLoading} onClick={() => formik.submitForm()} type="primary">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </StyleWrapper>
  );
};
export default TokenCharge;
