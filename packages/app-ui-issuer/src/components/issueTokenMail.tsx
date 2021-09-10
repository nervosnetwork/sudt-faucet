import { MailIssueInfo } from '@sudt-faucet/commons';
import { Form, Input, Button, Modal, DatePicker, message } from 'antd';
import moment, { Moment } from 'moment';
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
  const [isAdditionalModalVisible, setIsAdditionalModalVisible] = useState(false);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [mail, setMail] = useState('');
  const [amount, setAmount] = useState('');
  const [expiredDate, setExpiredDate] = useState(0);
  const { rcIdentity } = useRcSigner();
  const history = useHistory();
  const { udtId } = useParams<{ udtId: string }>();

  const showAdditionalModal = () => {
    setIsAdditionalModalVisible(true);
  };

  const handleAdditionalSubmit = async () => {
    const user: MailIssueInfo = {
      sudtId: udtId,
      mail,
      amount,
      expiredAt: expiredDate,
      additionalMessage,
    };
    try {
      await client.send_claimable_mails({ recipients: [user], rcIdentity });
      setIsAdditionalModalVisible(false);
      void message.success('Email send success');
      history.push(`/token-management/${udtId}`);
    } catch (error) {
      void message.error('Email send error');
    }
  };

  const handleAdditionalCancel = () => {
    setIsAdditionalModalVisible(false);
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

  const disabledDate = (current: Moment) => {
    return current.isBefore(moment().millisecond(expiredDate));
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
          <DatePicker showTime onChange={handleExpiredChange} disabledDate={disabledDate} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={showAdditionalModal}>
            Send An Claimable E-mail
          </Button>
        </Form.Item>
      </Form>
      <Modal
        title="E-Mali Content"
        visible={isAdditionalModalVisible}
        onOk={handleAdditionalSubmit}
        onCancel={handleAdditionalCancel}
      >
        <Input.TextArea value={additionalMessage} onChange={handleAdditionMessageChange} rows={10} />
      </Modal>
    </StyleWrapper>
  );
};
export default IssueTokenMail;
