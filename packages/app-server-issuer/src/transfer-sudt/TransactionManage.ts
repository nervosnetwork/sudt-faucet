import { Hash, Transaction } from '@ckb-lumos/base';
import {
  AcpTransferSudtBuilder,
  CkitProvider,
  EntrySigner,
  RcSupplyLockHelper,
  convertToRcIdentityFlag,
} from '@ckitjs/ckit';
import { utils } from '@sudt-faucet/commons';
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
    // FIXME AcpTransferSudtBuilder doesn't support batch transfer
    const txBuilder = new AcpTransferSudtBuilder(
      { recipients: builderOptions },
      this.provider,
      await this.signer.getAddress(),
    );
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
