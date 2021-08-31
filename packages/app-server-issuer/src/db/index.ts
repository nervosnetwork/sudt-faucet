import { utils } from '@ckit/ckit';
import { rpc } from '@sudt-faucet/commons';
import Knex, { Knex as IKnex } from 'knex';
import knexConfig from './knexfile';

interface MailIssue {
  id: number;
  mailAddress: string;
  sudtId: string;
  amount: string;
  secret: string;
  mailMessage: string;
  expireTime: number;
  claimTime: number;
  claimAddress: string;
  txHash: string;
  confirmNumber: number;
  confirmTime: number;
  status: string;
}

export class DB {
  private static instance: DB;
  private knex: IKnex;

  private constructor() {
    this.knex = Knex(knexConfig.development);
  }

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  public async batchInsertMailIssue(records: rpc.SendClaimableMailsPayload): Promise<void> {
    const recordsWithSecret = records.recipients.map((record) => {
      return {
        mail_address: record.mail,
        sudt_id: record.sudtId,
        amount: record.amount,
        secret: utils.randomHexString(32).slice(2),
        mail_message: record.additionalMessage,
        expire_time: record.expiredAt,
        status: 'unclaimed',
      };
    });
    await this.knex.batchInsert('mail_issue', recordsWithSecret, recordsWithSecret.length);
  }
}
