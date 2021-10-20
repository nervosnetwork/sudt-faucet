import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import Client from 'mailgun.js/dist/lib/client';
import { MailOption, MailSender } from './types';

interface MailgunConfig {
  apiKey: string;
  domain: string;
  // e.g. Something <no-reply@example.com>
  from: string;
}

export class MailgunSender implements MailSender {
  private client: Client;

  private config: MailgunConfig;

  constructor() {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const from = process.env.MAILGUN_FROM;

    if (!apiKey) throw new Error('the MAILGUN_API_KEY is required in env');
    if (!domain) throw new Error('the MAILGUN_DOMAIN is required in env, e.g. example.org');
    if (!from) throw new Error('the MAILGUN_FROM is required in env, e.g. Organization <no-reply@example.org>');

    this.config = { apiKey, domain, from };
    this.client = new Mailgun(FormData).client({
      username: 'api',
      key: apiKey,
    });
  }

  batchSend(options: MailOption[]): Promise<unknown> {
    const recipientVariables = options.reduce(
      (variables, item) => Object.assign(variables, { [item.toEmail]: item }),
      {} as Record<string, MailOption>,
    );

    return this.client.messages.create(this.config.domain, {
      from: this.config.from,
      to: options.map((item) => item.toEmail),
      subject: 'You have received some tokens',
      html: `<html lang="en"><p>%recipient.additionalMessage%</p><p>Click this link to <a target="_blank" href="%recipient.claimLink%">CLAIM</a> %recipient.amountWithSymbol% before %recipient.expireTime%. If the CLAIM link is not clickable, you can copy the following URL to a new tab to open it </br> %recipient.claimLink% </p></html>`,
      'recipient-variables': JSON.stringify(recipientVariables),
    });
  }
}
