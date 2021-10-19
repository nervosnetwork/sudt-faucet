export interface SenderOption {
  amountWithSymbol: string;
  toEmail: string;
  claimLink: string;
  additionalMessage: string;
  expireTime: string;
}

export interface MailSender {
  batchSend(options: SenderOption[]): Promise<unknown>;
}
