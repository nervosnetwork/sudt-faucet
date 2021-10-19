import { convertToRcIdentityFlag, RcIdentity, RcSupplyLockHelper, SudtInfo } from '@ckitjs/ckit';
import { utils } from '@sudt-faucet/commons';
import retry from 'async-retry';
import memoize from 'memoizee';
import { DB } from '../db';
import { loggerWithModule } from '../logger';
import { MailToSend, ServerContext } from '../types';
import { AssetAmount } from '../utils';
// import { SendGrid } from './sendgrid';
import { MailgunSender } from './mailgun';
import { MailSender, MailOption } from './types';

const logger = loggerWithModule('MailSender');

export async function startMailSender(context: ServerContext): Promise<void> {
  const mailSender = new MailgunSender();
  return startRoutine(context, mailSender);
}

async function startRoutine(context: ServerContext, mailSender: MailSender): Promise<void> {
  const db = DB.getInstance();
  const getMemoizedSudtInfo = memoize(getSudtInfo, {
    normalizer: (args) => JSON.stringify(args[1]),
    promise: true,
  });
  logger.info('Send mail routine started');

  for (;;) {
    try {
      const unsendMails = await db.getMailsToSend((process.env.BATCH_MAIL_LIMIT as unknown as number) ?? 50);
      logger.info(`New send mails round with records: ${unsendMails.length ? JSON.stringify(unsendMails) : '[]'}`);
      const secrets = unsendMails.map((value) => value.secret);
      if (unsendMails.length > 0) {
        try {
          for (const unsendMail of unsendMails) {
            const options = {
              rcIdentity: {
                flag: convertToRcIdentityFlag(unsendMail.sudt_issuer_rc_id_flag),
                pubkeyHash: unsendMail.sudt_issuer_pubkey_hash,
              },
              udtId: unsendMail.sudt_id,
            };
            const sudtInfo = await getMemoizedSudtInfo(context.rcHelper, options);
            if (!sudtInfo) throw new Error(`error: sudt info of ${JSON.stringify(options)} not existed`);
            unsendMail.amount =
              new AssetAmount(unsendMail.amount, sudtInfo.decimals).toHumanizeString() + ` ${sudtInfo.symbol}`;
          }
          const mailOptions = unsendMails.map(toMailOption);
          logger.info(`Send mails metadata: ${JSON.stringify(mailOptions)}`);
          await mailSender.batchSend(mailOptions);
          await db.updateStatusToWaitForClaim(secrets);
        } catch (e) {
          logger.error(`An error caught while send mails: ${e}`);
          await db.updateErrorBySecrets(secrets, String(e));
        }
      }
    } catch (e) {
      logger.error(`An error caught from db: ${e}`);
    }
    await utils.sleep(15000);
  }
}

async function getSudtInfo(
  rcHelper: RcSupplyLockHelper,
  options: { rcIdentity: RcIdentity; udtId: string },
): Promise<SudtInfo | undefined> {
  logger.info(`getSudtInfo not hit cache, options: ${JSON.stringify(options)}`);
  const sudtInfos = await retry<SudtInfo[]>(
    async () => {
      return rcHelper.listCreatedSudt(options);
    },
    {
      retries: 6,
      onRetry: (e, attempt) => {
        logger.warn(`(retry ${attempt} times) get sudt info of ${JSON.stringify(options)} with error: ${e}`);
      },
    },
  );
  return sudtInfos[0];
}

function toMailOption(mail: MailToSend): MailOption {
  if (!process.env.CLAIM_SUDT_URL) throw new Error('env CLAIM_SUDT_URL not set');

  const expireTime = mail.expire_time
    ? new Date(mail.expire_time).toLocaleString('en-US', { timeZone: 'UTC' }) + '(UTC Time)'
    : '';

  return {
    toEmail: mail.mail_address,
    amountWithSymbol: mail.amount,
    claimLink: `${process.env.CLAIM_SUDT_URL}?claim_secret=${mail.secret}`,
    additionalMessage: mail.mail_message,
    expireTime: expireTime,
  };
}
