import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { MailSender, SenderOption } from './types';

const mailgun = new Mailgun(FormData);

export function createMessenger(): MailSender {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM;

  if (!apiKey) throw new Error('the MAILGUN_API_KEY is required');
  if (!domain) throw new Error('the MAILGUN_DOMAIN is required');
  if (!from) throw new Error('the MAILGUN_FROM is required');

  const mg = mailgun.client({
    username: 'api',
    key: apiKey,
  });

  return {
    batchSend(options: SenderOption[]): Promise<unknown> {
      const recipientVariables = options.reduce(
        (variables, item) => Object.assign(variables, { [item.toEmail]: {} }),
        {} as Record<string, SenderOption>,
      );

      return mg.messages.create(domain, {
        from,
        to: options.map((item) => item.toEmail),
        subject: 'You have received some tokens',
        html: `<p>%recipient.additionalMessage%</p><p>Click this link to <a href="%recipient.cliamLink%">CLAIM</a> %recipient.amountWithSymbol% before %recipient.expireTime%. If the CLAIM link is not clickable, you can copy the following URL to a new tab to open it </br> %recipient.claimLink% </p>`,
        'recipient-variables': JSON.stringify(recipientVariables),
      });
    },
  };
}
