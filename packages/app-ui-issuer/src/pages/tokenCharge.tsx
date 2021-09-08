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
  capaticy: string;
  amount: string;
}

interface FormError {
  capaticy?: string;
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
    if (!values.capaticy) {
      errors.capaticy = 'Capaticy is Required';
    }
    const leftAmount = Number(foundUdtInfo.maxSupply) - Number(foundUdtInfo.currentSupply);
    if (!values.amount) {
      errors.amount = 'Capaticy is Required';
    } else if (Number(values.amount) > leftAmount) {
      errors.amount = `Must be ${leftAmount} or smaller`;
    }
    return errors;
  };

  function charge() {
    if (!chargeAddress) {
      void message.error('Charge address is loaded');
      return;
    }
    void new MintRcUdtBuilder(
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
    capaticy: '',
    amount: '',
  };

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: (values: FormValues) => {
      history.push('/token-list');
      charge();
    },
  });

  if (!chargeAddress) return null;
  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="to">
          <div>{chargeAddress}</div>
        </Form.Item>
        <Form.Item label="Capaticy(CKB)" name="capaticy">
          <Input
            {...formik.getFieldProps('capaticy')}
            value={ckbAmount}
            onChange={(e) => setCkbAmount(e.target.value)}
          />
          <Typography.Text type="danger">{formik.errors.capaticy}</Typography.Text>
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
