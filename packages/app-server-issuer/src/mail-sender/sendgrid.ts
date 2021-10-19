import sgMail from '@sendgrid/mail';
import { MailSender, MailOption } from './types';

export class SendGrid implements MailSender {
  constructor() {
    if (!process.env.SENDGRID_VERIFIED_SENDER) throw new Error('env SENDGRID_VERIFIED_SENDER not set');
    if (!process.env.SENDGRID_API_KEY) throw new Error('env SENDGRID_API_KEY not set');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async batchSend(options: MailOption[]): Promise<unknown> {
    return sgMail.send(options.map(this.toSendGridOption));
  }

  toSendGridOption(option: MailOption): sgMail.MailDataRequired {
    if (!process.env.SENDGRID_VERIFIED_SENDER) throw new Error('env SENDGRID_VERIFIED_SENDER not set');

    return {
      to: option.toEmail,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'You have received some tokens',
      text: `${option.additionalMessage}\n\nClick this link to claim ${option.amountWithSymbol} ${option.expireTime}:\n${option.claimLink}`,
    };
  }
}
