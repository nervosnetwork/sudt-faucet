import { rpc, utils } from '@sudt-faucet/commons';
import Knex, { Knex as IKnex } from 'knex';
import { MailIssue, MailToSend, TransactionToSend } from '../types';
import knexConfig from './knexfile';

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
        status: 'unsend',
      };
    });
    await this.knex.batchInsert('mail_issue', recordsWithSecret, recordsWithSecret.length);
  }

  public async getTransactionsToSend(limit: number): Promise<TransactionToSend[]> {
    return this.knex
      .select('sudt_id', 'amount', 'claim_address', 'secret')
      .from<MailIssue>('mail_issue')
      .where({ status: 'claimed' })
      .limit(limit);
  }

  public async getMailsToSend(limit: number): Promise<MailToSend[]> {
    return this.knex
      .select('mail_address', 'amount', 'secret', 'mail_message', 'expire_time')
      .from<MailIssue>('mail_issue')
      .where({ status: 'unsend' })
      .limit(limit);
  }

  public async getStatusBySecret(secret: string): Promise<string | undefined> {
    const ret = await this.knex.select('status').from<MailIssue>('mail_issue').where({ secret: secret });
    if (ret.length > 1) throw new Error('exception: secret not unique');
    return ret[0]?.status;
  }

  public async updateStatusBySecrets(secrets: string[], status: string): Promise<void> {
    await this.knex('mail_issue').whereIn('secret', secrets).update({ status: status });
  }

  public async updateTxHashBySecrets(secrets: string[], txHash: string, status: string): Promise<void> {
    await this.knex('mail_issue').whereIn('secret', secrets).update({ tx_hash: txHash, status: status });
  }

  public async claimBySecret(secret: string, address: string, status: string): Promise<void> {
    await this.knex('mail_issue').where({ secret: secret }).update({ status: status, claim_address: address });
  }
}
