import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Table, Modal, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import styled from 'styled-components';
import { emailIssue } from './types';

const StyleWrapper = styled.div`
  padding: 20px;
  .header {
    padding-bottom: 10px;
  }
  .column-header {
    display: flex;
    justify-content: space-between;
  }
`;

const IssueTokenMailBatch: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const changeExpiredDate = () => {
    showModal();
  };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const changeAmount = () => {};
  const columns: ColumnsType<emailIssue> = [
    {
      key: 'mail-key',
      title: 'mail',
      dataIndex: 'mail',
    },
    {
      key: 'amount-key',
      title: () => {
        return (
          <div className="column-header">
            amount{' '}
            <Button onClick={changeAmount} size="small">
              set
            </Button>
          </div>
        );
      },
      dataIndex: 'amount',
    },
    {
      key: 'expiredDate-key',
      title: () => {
        return (
          <div className="column-header">
            expired date{' '}
            <Button size="small" onClick={changeExpiredDate}>
              set
            </Button>
          </div>
        );
      },
      dataIndex: 'expiredDate',
    },
  ];
  const data: emailIssue[] = [
    {
      mail: 'wangximing1@cryptape.com',
      amount: 100,
      expiredDate: '2023-01-02',
    },
    {
      mail: 'wangximing2@cryptape.com',
      amount: 100,
      expiredDate: '2023-01-02',
    },
    {
      mail: 'wangximing3@cryptape.com',
      amount: 100,
      expiredDate: '2023-01-02',
    },
    {
      mail: 'wangximing4@cryptape.com',
      amount: 100,
      expiredDate: '2023-01-02',
    },
    {
      mail: 'wangximing5@cryptape.com',
      amount: 100,
      expiredDate: '2023-01-02',
    },
  ];
  return (
    <StyleWrapper>
      <div className="header">
        <Upload>
          <Button icon={<UploadOutlined />}>import data</Button>
        </Upload>
        <Button></Button>
      </div>
      <Table rowKey="mail" columns={columns} dataSource={data} />
      <div className="footer">
        <Button>Send Claimable E-mails</Button>
      </div>
      <Modal title="Edit" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Input />
      </Modal>
      ;
    </StyleWrapper>
  );
};
export default IssueTokenMailBatch;
