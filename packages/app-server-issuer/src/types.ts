export interface MailIssue {
  id: number;
  mail_address: string;
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
  status: string;
}

export type MailToSend = Pick<MailIssue, 'mail_address' | 'amount' | 'secret' | 'mail_message' | 'expire_time'>;

export type TransactionToSend = Pick<MailIssue, 'sudt_id' | 'amount' | 'claim_address' | 'secret'>;
