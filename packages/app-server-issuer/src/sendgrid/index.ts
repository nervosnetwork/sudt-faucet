import sgMail from '@sendgrid/mail';
import { utils } from '@sudt-faucet/commons';
import { DB } from '../db';
import { MailToSend } from '../types';

export async function startSendGrid(): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) throw new Error('env SENDGRID_API_KEY not set');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const db = DB.getInstance();

  for (;;) {
    try {
      const unsendMails = await db.getMailsToSend((process.env.BATCH_MAIL_LIMIT as unknown as number) ?? 500);
      if (unsendMails.length > 0) {
        const sgMails = unsendMails.map(toSGMail);
        await sgMail.send(sgMails);
        const secrets = unsendMails.map((value) => value.secret);
        await db.updateStatusBySecrets(secrets, 'unclaimed');
      }
    } catch (e) {
      // TODO use log
      console.error(`An error occurred while send mails: ${e}`);
    }
    await utils.sleep(3000);
  }
}

function toSGMail(mail: MailToSend): sgMail.MailDataRequired {
  if (!process.env.SENDGRID_VERIFIED_SENDER) throw new Error('SENDGRID_VERIFIED_SENDER not set');
  const expireDate = new Date(mail.expire_time);
  expireDate.toLocaleString('en-US', { timeZone: 'UTC' });

  return {
    to: mail.mail_address,
    from: process.env.SENDGRID_VERIFIED_SENDER,
    subject: 'Claim token with secret',
    text: `${mail.mail_message}\nClick this link to claim ${mail.amount} tokens before ${expireDate}:\nhttps://www.baidu.com?claim_secret=${mail.secret}`,
  };
}
