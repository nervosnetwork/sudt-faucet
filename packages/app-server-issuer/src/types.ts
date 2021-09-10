import { CkitProvider, internal } from '@ckitjs/ckit';

export interface ServerContext {
  ckitProvider: CkitProvider;
  txSigner: InstanceType<typeof internal['Secp256k1Signer']>;
}

export interface MailIssue {
  id: number;
  mail_address: string;
  sudt_issuer_pubkey_hash: string;
  sudt_issuer_rc_id_flag: number;
  sudt_id: string;
  amount: string;
  secret: string;
  mail_message: string;
  expire_time: number;
  claim_time: number;
  claim_address: string;
  tx_hash: string;
  confirm_number: number;
  confirm_time: number;
  status: MailIssueStatus;
  created_at: string;
}

export type MailIssueStatus =
  | 'WaitForSendMail'
  | 'WaitForClaim'
  | 'WaitForTransfer'
  | 'SendingTransaction'
  | 'WaitForTransactionCommit'
  | 'WaitForTransactionConfirm'
  | 'Done'
  | 'Disabled'
  | 'TransferSudtError'
  | 'SendMailError';

export type InsertMailIssue = Pick<
  MailIssue,
  | 'mail_address'
  | 'sudt_issuer_pubkey_hash'
  | 'sudt_issuer_rc_id_flag'
  | 'sudt_id'
  | 'amount'
  | 'secret'
  | 'mail_message'
  | 'expire_time'
  | 'status'
>;

export type MailToSend = Pick<MailIssue, 'mail_address' | 'amount' | 'secret' | 'mail_message' | 'expire_time'>;

export type TransactionToSend = Pick<
  MailIssue,
  'sudt_issuer_pubkey_hash' | 'sudt_issuer_rc_id_flag' | 'sudt_id' | 'amount' | 'claim_address' | 'secret'
>;

export type ClaimHistory = Pick<
  MailIssue,
  'mail_address' | 'amount' | 'secret' | 'created_at' | 'expire_time' | 'status' | 'claim_address'
>;
