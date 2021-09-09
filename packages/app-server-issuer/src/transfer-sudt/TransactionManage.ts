import { Hash, Transaction } from '@ckb-lumos/base';
import {
  AcpTransferSudtBuilder,
  CkitProvider,
  EntrySigner,
  RcSupplyLockHelper,
  convertToRcIdentityFlag,
} from '@ckitjs/ckit';
import { utils } from '@sudt-faucet/commons';
import retry from 'async-retry';
import { TransactionToSend } from '../types';

export class TransactionManage {
  constructor(private provider: CkitProvider, private signer: EntrySigner, private rcHelper: RcSupplyLockHelper) {}

  public async sendTransaction(txs: TransactionToSend[]): Promise<Hash> {
    const builderOptions = txs.map((tx) => {
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
      };
    });
    const txBuilder = new AcpTransferSudtBuilder(
      { recipients: builderOptions },
      this.provider,
      await this.signer.getAddress(),
    );

    let signedTx: Transaction;
    await retry(
      async () => {
        signedTx = await this.signer.seal(await txBuilder.build());
      },
      {
        retries: 6,
        onRetry: (e) => {
          console.log(`build transfer sudt tx error: ${e}`);
        },
      },
    );

    let txHash: Hash;
    await retry(
      async () => {
        txHash = await this.provider.sendTransaction(signedTx);
      },
      {
        retries: 6,
        onRetry: (e) => {
          console.log(`send transfer sudt tx error: ${e}`);
        },
      },
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return txHash;
  }

  public async waitForCommit(txHash: Hash): Promise<Transaction | null> {
    return this.provider.waitForTransactionCommitted(txHash, { timeoutMs: 180000 });
  }

  // TODO impl
  public async syncConfirmNumber(): Promise<void> {
    utils.unimplemented();
  }
}
