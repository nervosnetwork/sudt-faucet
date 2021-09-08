import { ExclamationCircleOutlined } from '@ant-design/icons';
import { rpc, ClaimHistory } from '@sudt-faucet/commons';
import { Typography, Button, Table, Form, Input, Select, Modal } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import client from '../configs/client';
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
    },
    {
      key: 'claimSecret',
      title: 'claimSecret',
      dataIndex: 'claimSecret',
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
      render: (claimSecret) => (
        <Button
          size="small"
          onClick={() => {
            disableCliam(claimSecret);
          }}
        >
          disable
        </Button>
      ),
    },
  ];

  const disableCliam = (claimSecret: string) => {
    Modal.confirm({
      title: 'Do you Want to disable this item?',
      icon: <ExclamationCircleOutlined />,
      content: 'user can not claim this token after disable',
      onOk() {
        void client.disable_claim_secret({ claimSecret });
      },
    });
  };

  const history = useHistory();
  const goCharge = () => {
    history.push('/token-charge');
  };
  const { udtId } = useParams<{ udtId: string }>();
  const [mailList, setMailList] = useState<ClaimHistory[]>([]);
  const [sudtBalance, setSudtBalance] = useState<string>();
  useEffect(() => {
    const getClaimHistoryData = async () => {
      const response: rpc.ListClaimHistoryResponse = await client.list_claim_history({ sudtId: udtId });
      setMailList(response.histories);
    };
    const getBalance = async () => {
      const response: rpc.GetClaimableSudtBalanceResponse = await client.get_claimable_sudt_balance({ sudtId: udtId });
      setSudtBalance(response.amount);
    };
    void getBalance();
    void getClaimHistoryData();
  }, []);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
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
        <Typography className="number">54,321.12345 CKB</Typography>
        <Typography className="number">{sudtBalance} INS</Typography>
      </div>
      <div className="accountList">
        <div className="filter">
          <Form {...layout} name="customized_form_controls" layout="inline">
            <Form.Item name="price" label="Filter:">
              <Input placeholder="email/address" />
            </Form.Item>
            <Form.Item>
              <Select defaultValue="All" style={{ width: 120 }}>
                <Select.Option value="wait-form-claim">wait form claim</Select.Option>
                <Select.Option value="expired">expired</Select.Option>
                <Select.Option value="claimed">claimed</Select.Option>
                <Select.Option value="all">all</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
        <Table
          rowKey={(item) => item.mail + item.expiredAt}
          columns={columns}
          dataSource={mailList}
          pagination={false}
        />
      </div>
    </StyleWrapper>
  );
};
export default TokenManagement;
