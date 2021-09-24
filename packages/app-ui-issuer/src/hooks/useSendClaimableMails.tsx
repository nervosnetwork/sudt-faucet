import { MailIssueInfo } from '@sudt-faucet/commons';
import { message } from 'antd';
import React from 'react';
import { useMutation, UseMutationResult } from 'react-query';
import client from '../configs/client';
import { useRcSigner } from './useSigner';

export function useSendClaimableMails(): UseMutationResult<unknown, unknown, MailIssueInfo[]> {
  const { rcIdentity } = useRcSigner();

  return useMutation(
    ['send-mails'],
    async (recipients: MailIssueInfo[]) => {
      return await client.send_claimable_mails({ recipients, rcIdentity });
    },
    {
      onSuccess() {
        void message.success('Email send success');
      },
      onError() {
        void message.error('Email send error');
      },
    },
  );
}
