import { Hash, Transaction } from '@ckb-lumos/base';
import { AcpTransferSudtBuilder, CkitProvider, EntrySigner, RcIdentity, RcSupplyLockHelper } from '@ckit/ckit';
import { utils } from '@sudt-faucet/commons';
import { TransactionToSend } from '../types';

export class TransactionManage {
  constructor(
    private provider: CkitProvider,
    private signer: EntrySigner,
    private rcHelper: RcSupplyLockHelper,
    private rcIdentity: RcIdentity,
  ) {}

  public async sendTransaction(txs: TransactionToSend[]): Promise<Hash> {
    const sudtScript = this.rcHelper.newSudtScript({ rcIdentity: this.rcIdentity, udtId: txs[0]!.sudt_id });
    const builderOptions = txs.map((tx) => ({
      recipient: tx.claim_address,
      sudt: sudtScript,
      amount: tx.amount,
      policy: 'findOrCreate',
    }));
    // FIXME AcpTransferSudtBuilder doesn't support batch transfer
    const txBuilder = new AcpTransferSudtBuilder(builderOptions, this.provider, this.signer);
    const signedTx = await this.signer.seal(await txBuilder.build());
    return this.provider.sendTransaction(signedTx);
  }

  public async waitForCommit(txHash: Hash): Promise<Transaction | null> {
    return this.provider.waitForTransactionCommitted(txHash);
  }

  public async syncConfirmNumber(): Promise<void> {
    utils.unimplemented();
  }
}
