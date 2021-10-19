export interface MailSender {
  batchSend(options: MailOption[]): Promise<unknown>;
}

export interface MailOption {
  amountWithSymbol: string;
  toEmail: string;
  claimLink: string;
  additionalMessage: string;
  expireTime: string;
}
