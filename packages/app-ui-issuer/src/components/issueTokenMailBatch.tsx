import { UploadOutlined } from '@ant-design/icons';
import { Button, Table, Modal, Input, DatePicker, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import client from '../configs/client';
import { EmailIssue } from '../types';

const StyleWrapper = styled.div`
  padding: 20px;
  .header {
    padding-bottom: 10px;
  }
  .column-header {
    display: flex;
    justify-content: space-between;
  }
  .footer {
    padding-top: 20px;
  }
  .file-input {
    display: none;
  }
  .file-upload-button {
    display: inline-block;
    border: 1px solid black;
    border-radius: 4px;
    border: 1px solid transparent;
    border-color: #d9d9d9;
    height: 32px;
    padding: 4px 15px;
    font-size: 14px;
    line-height: 1.5;
    span {
      padding-right: 10px;
    }
    &:hover {
      cursor: pointer;
    }
  }
`;

const IssueTokenMailBatch: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExpiredModalVisible, setIsExpiredModalVisible] = useState(false);
  const [isAddtionalModalVisible, setIsAddtionalModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [expiredDate, setExpired] = useState(0);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [userList, setUserList] = useState<EmailIssue[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const sendMail = async () => {
      if (!isSending) return;
      try {
        await client.send_claimable_mails({ recipients: userList });
        setIsAddtionalModalVisible(false);
        setIsSending(false);
        void message.success('Email send success');
      } catch (error) {
        void message.error('Email send error');
      }
    };
    void sendMail();
  }, [isSending, userList]);

  const { udtId } = useParams<{ udtId: string }>();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showExpiredModal = () => {
    setIsExpiredModalVisible(true);
  };

  const showAddtionalModal = () => {
    setIsAddtionalModalVisible(true);
  };

  const handleAmountSubmit = () => {
    setIsModalVisible(false);
    updateAmount(amount);
  };

  const handleExpiredSubmit = () => {
    setIsExpiredModalVisible(false);
    updateExpired(expiredDate);
  };

  const handleAddtionalSubmit = async () => {
    updateAdditional(additionalMessage);
    setIsSending(true);
  };

  const handleAddtionalCancel = () => {
    setIsAddtionalModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleExpiredCancel = () => {
    setIsExpiredModalVisible(false);
  };

  const handleFileChange = (files: FileList) => {
    function csvJSON(csv: string) {
      const lines: string[] = csv.split('\n');
      const result = [];
      for (let i = 1; i < lines.length; i++) {
        const email = lines[i]?.split(',')[0];
        email && result.push(email);
      }
      return result;
    }
    const fileReader = new FileReader();
    files[0] && fileReader.readAsText(files[0]);
    fileReader.addEventListener('loadend', (e) => {
      const mailList: string[] = csvJSON(fileReader.result as string);
      updateEmailList(mailList);
    });
  };

  const updateEmailList = (mailList: string[]) => {
    const newUserList = mailList.map((mail: string) => {
      return {
        sudtId: udtId,
        mail,
        amount: '',
        expiredAt: 0,
        additionalMessage: '',
      };
    });
    setUserList(newUserList);
  };

  const updateAmount = (amount: string) => {
    const newUserList = userList.map((user: EmailIssue) => {
      return { ...user, ...{ amount: amount } };
    });
    setUserList(newUserList);
  };

  const updateExpired = (expiredDate: number) => {
    const newUserList = userList.map((user: EmailIssue) => {
      return { ...user, ...{ expiredAt: expiredDate } };
    });
    setUserList(newUserList);
  };

  const updateAdditional = (additionalMessage: string) => {
    const newUserList = userList.map((user: EmailIssue) => {
      return { ...user, ...{ additionalMessage: additionalMessage } };
    });
    setUserList(newUserList);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleExpiredChange = (dateValue: unknown, dateString: string) => {
    setExpired(new Date(dateString).getTime());
  };

  const handelAdditionMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalMessage(e.target.value);
  };

  const columns: ColumnsType<EmailIssue> = [
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
            <Button onClick={showModal} size="small">
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
            <Button size="small" onClick={showExpiredModal}>
              set
            </Button>
          </div>
        );
      },
      dataIndex: 'expiredAt',
      render: (expiredAt) => <div>{expiredAt ? moment(expiredAt).format('YYYY-MM-DD HH:mm') : ''}</div>,
    },
  ];

  return (
    <StyleWrapper>
      <div className="header">
        <label>
          <input
            type="file"
            className="file-input"
            onChange={(e) => e.target.files && handleFileChange(e.target.files)}
          />
          <div className="file-upload-button">
            <UploadOutlined />
            import data
          </div>
        </label>
      </div>
      <Table rowKey="mail" columns={columns} dataSource={userList} />
      <div className="footer">
        <Button onClick={showAddtionalModal}>Send Claimable E-mails</Button>
      </div>
      <Modal title="Edit" visible={isModalVisible} onOk={handleAmountSubmit} onCancel={handleCancel}>
        <Input value={amount} onChange={handleAmountChange} />
      </Modal>
      <Modal title="Edit" visible={isExpiredModalVisible} onOk={handleExpiredSubmit} onCancel={handleExpiredCancel}>
        <DatePicker showTime onChange={handleExpiredChange} />
      </Modal>
      <Modal
        title="E-Mali Content"
        visible={isAddtionalModalVisible}
        onOk={handleAddtionalSubmit}
        onCancel={handleAddtionalCancel}
      >
        <Input.TextArea value={additionalMessage} onChange={handelAdditionMessageChange} rows={10} />
      </Modal>
    </StyleWrapper>
  );
};
export default IssueTokenMailBatch;
