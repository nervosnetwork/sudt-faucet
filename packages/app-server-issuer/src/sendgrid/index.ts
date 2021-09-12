import sgMail from '@sendgrid/mail';
import { utils } from '@sudt-faucet/commons';
import { DB } from '../db';
import { logger } from '../logger';
import { MailToSend } from '../types';

export async function startSendGrid(): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) throw new Error('env SENDGRID_API_KEY not set');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const db = DB.getInstance();

  for (;;) {
    try {
      const unsendMails = await db.getMailsToSend((process.env.BATCH_MAIL_LIMIT as unknown as number) ?? 50);
      logger.info(`New send mails round with records: ${unsendMails.length ? unsendMails : '[]'}`);
      if (unsendMails.length > 0) {
        const sgMails = unsendMails.map(toSGMail);
        await sgMail.send(sgMails);
        const secrets = unsendMails.map((value) => value.secret);
        await db.updateStatusBySecrets(secrets, 'WaitForClaim');
      }
    } catch (e) {
      logger.error(`An error catched while send mails: ${e}`);
    }
    await utils.sleep(15000);
  }
}

function toSGMail(mail: MailToSend): sgMail.MailDataRequired {
  if (!process.env.SENDGRID_VERIFIED_SENDER) throw new Error('env SENDGRID_VERIFIED_SENDER not set');
  if (!process.env.CLAIM_SUDT_DOMAIN) throw new Error('env CLAIM_SUDT_DOMAIN not set');

  const expireDate = mail.expire_time
    ? 'before' + new Date(mail.expire_time).toLocaleString('en-US', { timeZone: 'UTC' })
    : '';

  return {
    to: mail.mail_address,
    from: process.env.SENDGRID_VERIFIED_SENDER,
    subject: 'You have received some tokens',
    text: `${mail.mail_message}\nClick this link to claim ${mail.amount} tokens ${expireDate}:\n${process.env.CLAIM_SUDT_DOMAIN}?claim_secret=${mail.secret}`,
  };
}
