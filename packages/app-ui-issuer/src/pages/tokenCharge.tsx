import { Form, Input, Button, Typography } from 'antd';
import { useFormik } from 'formik';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useListRcSupplyLockUdtQuery } from '../hooks';

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
  const { udtId } = useParams<{ udtId: string }>();
  const { data: udts } = useListRcSupplyLockUdtQuery(udtId);
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

  const initialValues: FormValues = {
    capaticy: '',
    amount: '',
  };

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: (values: FormValues) => {
      history.push('/token-list');
    },
  });
  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="Capaticy(CKB)" name="capaticy">
          <Input {...formik.getFieldProps('capaticy')} />
          <Typography.Text type="danger">{formik.errors.capaticy}</Typography.Text>
        </Form.Item>

        <Form.Item label="Amount(Ins)" name="amount">
          <Input {...formik.getFieldProps('amount')} />
          <Typography.Text type="danger">{formik.errors.amount}</Typography.Text>
        </Form.Item>

        <Form.Item>
          <Button onClick={() => formik.submitForm()} type="primary">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </StyleWrapper>
  );
};
export default TokenCharge;
