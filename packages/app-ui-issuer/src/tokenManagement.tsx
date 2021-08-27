import { Typography, Button, Table, Form, Input, Select } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React from 'react';
import styled from 'styled-components';
import { account } from './types';

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
  const columns: ColumnsType<account> = [
    {
      key: 'mail',
      title: 'mail',
      dataIndex: 'mail',
    },
    {
      key: 'date',
      title: 'date',
      dataIndex: 'date',
    },
    {
      key: 'amount',
      title: 'amount',
      dataIndex: 'amount',
    },
    {
      key: 'address',
      title: 'address',
      dataIndex: 'address',
    },
    {
      key: 'status',
      title: 'status',
      dataIndex: 'status',
    },
    {
      key: 'claimCode',
      title: 'claimCode',
      dataIndex: 'claimCode',
    },
  ];
  const data: account[] = [
    {
      mail: 'wangximing@cryptape.com',
      date: '2020-09-09',
      amount: 100,
      address: 'ckbxxxxx',
      status: 'expired',
      claimCode: 'dajskldfj',
    },
    {
      mail: 'wangximing1@cryptape.com',
      date: '2020-09-09',
      amount: 100,
      address: 'ckbxxxxx',
      status: 'expired',
      claimCode: 'dajskldfj',
    },
    {
      mail: 'wangximing2@cryptape.com',
      date: '2020-09-09',
      amount: 100,
      address: 'ckbxxxxx',
      status: 'expired',
      claimCode: 'dajskldfj',
    },
    {
      mail: 'wangximing3@cryptape.com',
      date: '2020-09-09',
      amount: 100,
      address: 'ckbxxxxx',
      status: 'expired',
      claimCode: 'dajskldfj',
    },
  ];

  return (
    <StyleWrapper>
      <div className="account">
        <Typography className="description">Account balance for claim</Typography>
        <Typography className="number">54,321.12345</Typography>
      </div>
      <div className="accountList">
        <div className="filter">
          <Form name="customized_form_controls" layout="inline">
            <Form.Item name="price" label="Price">
              <Input />
            </Form.Item>
            <Form.Item>
              <Select defaultValue="All" style={{ width: 120 }}>
                <Select.Option value="wait-form-claim">wait form claim</Select.Option>
                <Select.Option value="expired">expired</Select.Option>
                <Select.Option value="expired">expired</Select.Option>
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
        <Table rowKey="mail" columns={columns} dataSource={data} />
      </div>
    </StyleWrapper>
  );
};
export default TokenManagement;
