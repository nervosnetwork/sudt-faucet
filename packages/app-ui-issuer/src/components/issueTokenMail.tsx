import { MailIssueInfo, fixedStringToBigint } from '@sudt-faucet/commons';
import { Form, Input, Button, Modal, DatePicker } from 'antd';
import moment, { Moment } from 'moment';
import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useGetDecimals, useSendClaimableMails } from '../hooks';

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
  const history = useHistory();
  const { udtId } = useParams<{ udtId: string }>();
  const decimals = useGetDecimals(udtId);
  const { mutateAsync: sendMails } = useSendClaimableMails();

  const showAdditionalModal = () => {
    setIsAdditionalModalVisible(true);
  };

  const handleAdditionalSubmit = async () => {
    const sendAmount = fixedStringToBigint(amount, decimals).toString();
    const user: MailIssueInfo = {
      sudtId: udtId,
      mail,
      amount: sendAmount,
      expiredAt: expiredDate,
      additionalMessage,
    };
    sendMails([user]).then(() => {
      setIsAdditionalModalVisible(false);
      history.push(`/token-management/${udtId}`);
    });
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
