import { Hash, Transaction } from '@ckb-lumos/base';
import {
  AcpTransferSudtBuilder,
  CkitProvider,
  convertToRcIdentityFlag,
  EntrySigner,
  RcSupplyLockHelper,
  RecipientOption,
} from '@ckitjs/ckit';
import { utils } from '@sudt-faucet/commons';
import retry from 'async-retry';
import { loggerWithModule } from '../logger';
import { TransactionToSendWithCapacity } from '../types';

const logger = loggerWithModule('TransferSudt');

export class TransactionManage {
  constructor(private provider: CkitProvider, private signer: EntrySigner, private rcHelper: RcSupplyLockHelper) {}

  public async buildTransaction(txs: TransactionToSendWithCapacity[]): Promise<Transaction> {
    const builderOptions = txs.map<RecipientOption>((tx) => {
      const rcIdentity = {
        flag: convertToRcIdentityFlag(tx.sudt_issuer_rc_id_flag),
        pubkeyHash: tx.sudt_issuer_pubkey_hash,
      };
      const sudtScript = this.rcHelper.newSudtScript({ rcIdentity, udtId: tx.sudt_id });
      return {
        recipient: tx.claim_address,
        sudt: sudtScript,
        amount: tx.amount,
        policy: 'findOrCreate' as const,
        // send a lock-only cell to transfer CKB in a transfer sudt tx
        createCapacity: tx.createCapacity,
      };
    });
    const txBuilder = new AcpTransferSudtBuilder(
      { recipients: builderOptions },
      this.provider,
      await this.signer.getAddress(),
    );

    return retry<Transaction>(
      async () => {
        const unsignedTx = await txBuilder.build();
        return this.signer.seal(unsignedTx);
      },
      {
        retries: 6,
        onRetry: (e, attempt) => {
          logger.warn(`(retry ${attempt} times) build transfer sudt tx error: ${e}`);
        },
      },
    );
  }

  public async sendTransaction(signedTx: Transaction): Promise<Hash> {
    return retry<Hash>(
      async () => {
        return this.provider.sendTransaction(signedTx);
      },
      {
        retries: 6,
        onRetry: (e, attempt) => {
          logger.warn(`(retry ${attempt} times) send transfer sudt tx error: ${e}`);
        },
      },
    );
  }

  public async waitForCommit(txHash: Hash): Promise<Transaction> {
    return retry<Transaction>(
      async () => {
        return this.provider.waitForTransactionCommitted(txHash);
      },
      {
        retries: 10,
        maxTimeout: 10000,
        onRetry: (e, attempt) => {
          logger.warn(`(retry ${attempt} times) query tx status error: ${e}`);
        },
      },
    );
  }

  // TODO impl
  public async syncConfirmNumber(): Promise<void> {
    utils.unimplemented();
  }
}
