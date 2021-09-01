import sgMail from '@sendgrid/mail';
import { utils } from '@sudt-faucet/commons';
import dotenv from 'dotenv';
import { DB } from '../db';
import { MailToSend } from '../types';

dotenv.config();
const BATCH_MAIL_LIMIT = 500;

export async function startSendGrid(): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY not set');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const db = DB.getInstance();

  for (;;) {
    try {
      const unsendMails = await db.getMailsToSend(BATCH_MAIL_LIMIT);
      if (unsendMails.length > 0) {
        const sgMails = unsendMails.map(toSGMail);
        await sgMail.send(sgMails);
        for (const mail of unsendMails) {
          await db.updateStatusBySecret(mail.secret, 'unclaimed');
        }
      }
    } catch (e) {
      // TODO use log
      console.error(`An error occurred while send mails: ${e}`);
    }
    await utils.sleep(3000);
  }
}

// TODO optimize mail context
function toSGMail(mail: MailToSend): sgMail.MailDataRequired {
  if (!process.env.SENDGRID_VERIFIED_SENDER) throw new Error('SENDGRID_VERIFIED_SENDER not set');

  return {
    to: mail.mail_address,
    from: process.env.SENDGRID_VERIFIED_SENDER,
    subject: 'Claim token with secret',
    text: `Hi, ${mail.mail_message}\nClick this link to claim ${mail.amount} tokens before ${mail.expire_time}:\nhttps://xx.com?claim_secret=${mail.secret}`,
  };
}
