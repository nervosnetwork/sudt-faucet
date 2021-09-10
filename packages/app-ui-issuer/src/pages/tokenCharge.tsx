import { MintRcUdtBuilder } from '@ckitjs/ckit';
import { Form, Input, Button, Typography, message } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import client from '../configs/client';
import { WalletContainer } from '../containers';
import { useListRcSupplyLockUdtQuery, useProvider, useRcSigner, useSendTransaction } from '../hooks';
import { fixedStringToBigint, bigintToFixedString, fixString } from '@sudt-faucet/commons';

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

const CKB_DECIMAL = 8;

const TokenCharge: React.FC = () => {
  const wallet = WalletContainer.useContainer();
  const history = useHistory();
  const provider = useProvider();
  const { udtId } = useParams<{ udtId: string }>();
  const { data: udts } = useListRcSupplyLockUdtQuery(udtId);
  const { rcIdentity } = useRcSigner();
  const { mutateAsync: sendTransaction, isLoading } = useSendTransaction();

  const [chargeAddress, setChargeAddress] = useState<string>();

  useEffect(() => {
    void client.get_claimable_account_address().then(setChargeAddress);
  }, []);

  const address = wallet.stage === 'readyToSign' ? wallet.address : '';

  const query = useQuery(
    ['queryBalance', { address }],
    () => {
      return provider.getCkbLiveCellsBalance(address);
    },
    {
      enabled: !!address,
    },
  );

  const foundUdtInfo = udts?.[0];
  const validate = async (values: FormValues) => {
    if (!foundUdtInfo) return;
    if (!query.data) return;
    const errors: FormError = {};
    if (!values.capacity) {
      errors.capacity = 'Capacity(CKB) is Required';
    } else if (fixedStringToBigint(values.capacity, CKB_DECIMAL) > BigInt(query.data)) {
      errors.capacity = `Must be less than or equal to ${bigintToFixedString(BigInt(query.data), CKB_DECIMAL)}`;
    }
    const leftAmount = BigInt(foundUdtInfo.maxSupply) - BigInt(foundUdtInfo.currentSupply);
    if (!values.amount) {
      errors.amount = `Amount(${foundUdtInfo.symbol}) is Required`;
    } else if (fixedStringToBigint(values.amount, foundUdtInfo.decimals) > leftAmount) {
      errors.amount = `Must be less than or equal to ${bigintToFixedString(leftAmount, foundUdtInfo.decimals)}`;
    }
    return errors;
  };

  function charge(values: FormValues) {
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
            amount: fixedStringToBigint(values.amount, foundUdtInfo?.decimals || 0).toString(),
            capacityPolicy: 'findOrCreate',
            additionalCapacity: fixedStringToBigint(values.capacity, CKB_DECIMAL).toString(),
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
      charge(values)
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
      {foundUdtInfo && (
        <Form name="basic">
          <Form.Item label="to">
            <div>{chargeAddress}</div>
          </Form.Item>
          <Form.Item label="Capacity(CKB)" name="capacity">
            <Input
              onChange={(e) => {
                const value = e.target.value.replace(/^\D*(\d*(?:\.\d*)?).*$/g, '$1');
                void formik.setFieldValue('capacity', fixString(value, CKB_DECIMAL), true);
              }}
              value={formik.values.capacity}
              onBlur={formik.handleBlur}
            />
            <Typography.Text type="danger">{formik.errors.capacity}</Typography.Text>
          </Form.Item>

          <Form.Item label={`Amount(${foundUdtInfo.symbol})`} name="amount">
            <Input
              onChange={(e) => {
                //TODO replace with new RegExp
                // const value = e.target.value.replace(/^\D*(\d*(?:\.\d{0, foundUdtInfo.decimals})?).*$/g, '$1');
                const value = e.target.value.replace(/^\D*(\d*(?:\.\d*)?).*$/g, '$1');
                void formik.setFieldValue('amount', fixString(value, foundUdtInfo.decimals), true);
              }}
              value={formik.values.amount}
              onBlur={formik.handleBlur}
            />
            <Typography.Text type="danger">{formik.errors.amount}</Typography.Text>
          </Form.Item>

          <Form.Item>
            <Button
              disabled={!formik.isValid || !formik.dirty}
              loading={isLoading}
              onClick={() => formik.submitForm()}
              type="primary"
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      )}
    </StyleWrapper>
  );
};
export default TokenCharge;
