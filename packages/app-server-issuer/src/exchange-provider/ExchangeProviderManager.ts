import { hd, Cell, Indexer, helpers, Address, HexString, HexNumber } from '@ckb-lumos/lumos';
import { AcpTransferSudtBuilder, CkitProvider } from '@ckitjs/ckit';
import { Secp256k1Signer } from 'ckit/packages/ckit/src/wallets/Secp256k1Wallet';
import { BigNumber } from 'ethers';
import { ServerContext } from '../types';

export class ExchangeProviderManager {
  private cells: Cell[] = [];
  private initiated: boolean;
  private config!: Config;
  private context!: ServerContext;
  private providerAddress!: Address;

  private static sigleton: ExchangeProviderManager | undefined;

  static getInstance(): ExchangeProviderManager {
    if (ExchangeProviderManager.sigleton == undefined) {
      ExchangeProviderManager.sigleton = new ExchangeProviderManager();
    }

    return ExchangeProviderManager.sigleton;
  }

  private constructor() {
    this.initiated = false;
  }

  private shouldInitiated() {
    if (!this.initiated) {
      throw new Error('ExchangeProviderManager is not initiated');
    }
  }

  private async refreshCells(): Promise<void> {
    this.shouldInitiated();

    const indexer = new Indexer(this.context.ckitProvider.mercuryUrl, this.context.ckitProvider.rpcUrl);
    const cells = (
      await indexer.getCells({
        script_type: 'lock',
        script: helpers.parseAddress(this.providerAddress),
      })
    ).objects;

    if (cells.length < this.config.cellAmount) {
      this.createProviderCells();
      this.refreshCells();
    } else {
      this.cells = cells.sort((a, b) => BigNumber.from(b.block_number).sub(BigNumber.from(a.block_number)).toNumber());
    }
  }

  private async createProviderCells(): Promise<void> {
    this.shouldInitiated();

    const builder = new AcpTransferSudtBuilder(
      {
        recipients: Array.from({ length: this.config.cellAmount }).map(() => {
          return {
            recipient: this.providerAddress,
            sudt: {
              code_hash: this.context.ckitProvider.getScriptConfig('SUDT').CODE_HASH,
              hash_type: 'type',
              args: this.config.sudtArgs,
            },
            amount: BigNumber.from(0).toHexString(),
            policy: 'createCell',
            additionalCapacity: BigNumber.from(this.config.initCapacity).toHexString(),
          };
        }),
      },
      this.context.ckitProvider,
      this.providerAddress,
    );
    const unsignedTx = await builder.build();
    const signer = new Secp256k1Signer(this.context.privateKey!, this.context.ckitProvider, {
      code_hash: this.context.ckitProvider.config.SCRIPTS.SECP256K1_BLAKE160.CODE_HASH,
      hash_type: this.context.ckitProvider.config.SCRIPTS.SECP256K1_BLAKE160.HASH_TYPE,
    });
    const tx = await signer.seal(unsignedTx);
    const hash = await this.context.ckitProvider.sendTransaction(tx);
    await this.context.ckitProvider.waitForTransactionCommitted(hash);
  }

  async initiateConfig(config: Config, context: ServerContext): Promise<void> {
    this.config = config;
    this.providerAddress = helpers.generateSecp256k1Blake160Address(
      hd.key.privateKeyToBlake160(this.context.ckitProvider.rpcUrl),
    );
    this.context = context;
    this.initiated = true;

    await this.refreshCells();
  }

  async getLeagalCells(sudtAmount: HexString): Promise<Cell[]> {
    this.shouldInitiated();

    let cells: Cell[] = [];
    const needCapacity = BigNumber.from(sudtAmount).mul(this.config.sudtExchangeRate);
    let capacity = BigNumber.from(0);

    while (capacity.lt(needCapacity)) {
      const cell = this.cells.shift();

      if (cell == undefined) {
        this.refreshCells();
        capacity = BigNumber.from(0);
        cells = [];
      } else {
        capacity = capacity.add(BigNumber.from(cell.cell_output.capacity));
        cells.push(cell);
      }
    }

    return cells;
  }
}
