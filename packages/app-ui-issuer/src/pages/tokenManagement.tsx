import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ClaimHistory, bigintToFixedString } from '@sudt-faucet/commons';
import { Typography, Button, Table, Form, Input, Select, Modal, Spin, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AssetAmount, CkbAssetAmount } from '../components/assetAmount';
import client from '../configs/client';
import { useListRcSupplyLockUdtQuery } from '../hooks';
import { useChargeCellBalanceQuery } from '../hooks/useChargeCellBalanceQuery';
import { formatTimeSpan } from '../utils';

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

  .account {
    padding-bottom: 10px;
  }

  .number {
    font-size: 28px;
  }

  .filter {
    padding-bottom: 10px;
  }
`;

const TokenManagement: React.FC = () => {
  const columns: ColumnsType<ClaimHistory> = [
    {
      key: 'mail',
      title: 'mail',
      dataIndex: 'mail',
    },
    {
      key: 'createdAt',
      title: 'createdAt',
      dataIndex: 'createdAt',
      render: (createdAt) => <div>{formatTimeSpan(createdAt)}</div>,
    },
    {
      key: 'expiredAt',
      title: 'expiredAt',
      dataIndex: 'expiredAt',
      render: (expiredAt) => <div>{formatTimeSpan(expiredAt)}</div>,
    },
    {
      key: 'amount',
      title: 'amount',
      dataIndex: 'amount',
      render: (amount) => <div>{bigintToFixedString(amount, decimals)}</div>,
    },
    {
      key: 'claimSecret',
      title: 'claimSecret',
      dataIndex: 'claimSecret',
    },
    {
      key: 'claimAddress',
      title: 'claimAddress',
      dataIndex: ['claimStatus', 'address'],
    },
    {
      key: 'claimStatus',
      title: 'claimStatus',
      dataIndex: 'claimStatus',
      render: (claimStatus) => <div>{claimStatus.status}</div>,
    },
    {
      key: 'action',
      title: 'action',
      dataIndex: 'claimSecret',
      render: (claimSecret, record: ClaimHistory) => {
        return record.claimStatus.status !== 'unclaimed' ? (
          <div></div>
        ) : (
          <Button
            size="small"
            onClick={() => {
              disableClaim(claimSecret);
            }}
          >
            disable
          </Button>
        );
      },
    },
  ];

  const disableClaim = (claimSecret: string) => {
    Modal.confirm({
      title: 'Disable',
      icon: <ExclamationCircleOutlined />,
      content: 'Would you want to disable the claim secret?',
      onOk() {
        client
          .disable_claim_secret({ claimSecret })
          .then(() => {
            void queryClient.invalidateQueries('getClaimHistoryData');
            void message.success('disable the claim secret success');
          })
          .catch(() => {
            void message.error('disable the claim secret fail');
          });
      },
    });
  };

  const [addressOrEmail, setAddressOrEmail] = useState('');
  const [status, setStatus] = useState('');

  const history = useHistory();
  const goCharge = () => {
    history.push(`/token-charge/${udtId}`);
  };
  const { udtId } = useParams<{ udtId: string }>();
  const { data: udts } = useListRcSupplyLockUdtQuery(udtId);
  const decimals = udts?.[0].decimals || 0;
  const queryClient = useQueryClient();

  const historyQuery = useQuery(
    ['getClaimHistoryData', { sudtId: udtId, status: status, addressOrEmail: addressOrEmail }],
    () => {
      return client.list_claim_history({ sudtId: udtId, status, addressOrEmail });
    },
    {
      onError: (error) => {
        void message.error(error as string);
        history.push('/login');
      },
    },
  );

  const { data: chargeBalance } = useChargeCellBalanceQuery(udtId);
  interface SearchForm {
    addressOrEmail: string;
    status: string;
  }

  const formik = useFormik<SearchForm>({
    initialValues: {
      addressOrEmail: '',
      status: 'all',
    },
    onSubmit: (val) => {
      setAddressOrEmail(val.addressOrEmail);
      setStatus(val.status);
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

  const handleChange = (value: string) => {
    void formik.setFieldValue('status', value);
  };
  return (
    <StyleWrapper>
      <div className="account">
        <Typography className="description">
          Account balance for claim{' '}
          <Button size="small" onClick={goCharge}>
            charge
          </Button>
        </Typography>
        <Typography className="number">
          {chargeBalance ? <CkbAssetAmount {...chargeBalance.ckb} /> : <Spin />}
        </Typography>
        <Typography className="number">{chargeBalance ? <AssetAmount {...chargeBalance.udt} /> : <Spin />}</Typography>
      </div>
      <div className="accountList">
        <div className="filter">
          <Form name="customized_form_controls" layout="inline">
            <Form.Item name="filter" label="Filter:">
              <Input
                name="addressOrEmail"
                placeholder="email/address"
                onChange={formik.handleChange}
                value={formik.values.addressOrEmail}
              />
            </Form.Item>
            <Form.Item>
              <Select style={{ width: 240 }} onChange={(value) => handleChange(value)} value={formik.values.status}>
                <Select.Option value="all">all</Select.Option>
                <Select.Option value="unclaimed">unclaimed</Select.Option>
                <Select.Option value="claiming">claiming</Select.Option>
                <Select.Option value="claimed">claimed</Select.Option>
                <Select.Option value="disabled">disabled</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={formik.submitForm}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
        <Table
          rowKey={(item) => item.mail + item.createdAt + item.claimSecret}
          columns={columns}
          dataSource={historyQuery.data?.histories}
          pagination={false}
        />
      </div>
    </StyleWrapper>
  );
};
export default TokenManagement;
