import { MintRcUdtBuilder } from '@ckitjs/ckit';
import { Button, Form, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import client from '../configs/client';
import { useProvider, useRcSigner, useSendTransaction } from '../hooks';

const StyleWrapper = styled.div`
  padding: 20px 60px;
`;

const TokenCharge: React.FC = () => {
  const provider = useProvider();
  const { udtId } = useParams<{ udtId: string }>();
  const { rcIdentity } = useRcSigner();
  const { mutateAsync: sendTransaction, isLoading } = useSendTransaction();

  const [chargeAddress, setChargeAddress] = useState<string>();

  const [ckbAmount, setCkbAmount] = useState('0');
  const [sudtAmount, setSudtAmount] = useState('0');

  useEffect(() => {
    void client.get_claimable_account_address().then(setChargeAddress);
  }, []);

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

  if (!chargeAddress) return null;

  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="to">
          <div>{chargeAddress}</div>
        </Form.Item>
        <Form.Item label="Capacity(CKB)" name="capacity" rules={[{ required: true, message: 'Please input capaticy' }]}>
          <Input value={ckbAmount} onChange={(e) => setCkbAmount(e.target.value)} />
        </Form.Item>

        <Form.Item label="Amount(Ins)" name="amount" rules={[{ required: true, message: 'Please input amount!' }]}>
          <Input value={sudtAmount} onChange={(e) => setSudtAmount(e.target.value)} />
        </Form.Item>

        <Form.Item>
          <Button loading={isLoading} onClick={charge} type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </StyleWrapper>
  );
};
export default TokenCharge;
