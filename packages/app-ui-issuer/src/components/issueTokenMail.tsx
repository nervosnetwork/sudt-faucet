import { MailIssueInfo } from '@sudt-faucet/commons';
import { Form, Input, Button, Modal, DatePicker, message } from 'antd';
import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import client from '../configs/client';
import { useRcSigner } from '../hooks';

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
`;

const IssueTokenMail: React.FC = () => {
  const [isAddtionalModalVisible, setIsAddtionalModalVisible] = useState(false);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [mail, setMail] = useState('');
  const [amount, setAmount] = useState('');
  const [expiredDate, setExpiredDate] = useState(0);
  const { rcIdentity } = useRcSigner();
  const history = useHistory();
  const { udtId } = useParams<{ udtId: string }>();

  const showAddtionalModal = () => {
    setIsAddtionalModalVisible(true);
  };

  const handleAddtionalSubmit = async () => {
    const user: MailIssueInfo = {
      sudtId: udtId,
      mail,
      amount,
      expiredAt: expiredDate,
      additionalMessage,
    };
    try {
      await client.send_claimable_mails({ recipients: [user], rcIdentity });
      setIsAddtionalModalVisible(false);
      void message.success('Email send success');
      history.push(`/token-management/${udtId}`);
    } catch (error) {
      void message.error('Email send error');
    }
  };

  const handleAddtionalCancel = () => {
    setIsAddtionalModalVisible(false);
  };

  const handleMailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMail(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleAdditionMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalMessage(e.target.value);
  };

  const handleExpiredChange = (dateValue: unknown, dateString: string) => {
    setExpiredDate(new Date(dateString).getTime());
  };

  return (
    <StyleWrapper>
      <Form name="basic">
        <Form.Item label="e-mail" name="e-mail" rules={[{ required: true, message: 'Please input your e-mail!' }]}>
          <Input value={mail} onChange={handleMailChange} />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: 'Please input your token amount!' }]}
        >
          <Input value={amount} onChange={handleAmountChange} />
        </Form.Item>

        <Form.Item
          label="Expired Time"
          name="expiredTime"
          rules={[{ required: true, message: 'Please input your token expired time!' }]}
        >
          <DatePicker showTime onChange={handleExpiredChange} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={showAddtionalModal}>
            Send An Claimable E-mail
          </Button>
        </Form.Item>
      </Form>
      <Modal
        title="E-Mali Content"
        visible={isAddtionalModalVisible}
        onOk={handleAddtionalSubmit}
        onCancel={handleAddtionalCancel}
      >
        <Input.TextArea value={additionalMessage} onChange={handleAdditionMessageChange} rows={10} />
      </Modal>
    </StyleWrapper>
  );
};
export default IssueTokenMail;
