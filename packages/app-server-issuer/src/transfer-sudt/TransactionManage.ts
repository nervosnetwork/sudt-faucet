import { Hash } from '@ckb-lumos/base';
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
    const builderOptions = txs.map((tx) => ({ recipient: tx.claim_address, sudt: sudtScript, amount: tx.amount }));
    // FIXME AcpTransferSudtBuilder doesn't support batch transfer
    const txBuilder = new AcpTransferSudtBuilder(builderOptions[0]!, this.provider, this.signer);
    const signedTx = await this.signer.seal(await txBuilder.build());
    return this.provider.sendTransaction(signedTx);
  }

  public async waitForCommit(txHashes: Hash[]): Promise<unknown> {
    const waitPromises = new Array(0);
    txHashes.forEach((txHash) => waitPromises.push(this.provider.waitForTransactionCommitted(txHash)));
    return Promise.all(waitPromises);
  }

  public async syncConfirmNumber(): Promise<void> {
    utils.unimplemented();
  }
}
