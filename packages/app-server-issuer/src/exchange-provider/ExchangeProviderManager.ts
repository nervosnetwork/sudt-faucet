import { number, bytes } from '@ckb-lumos/codec';
import { Cell, helpers, HexString, BI as BigNumber } from '@ckb-lumos/lumos';
import { AcpTransferSudtBuilder } from '@ckitjs/ckit';
import { loggerWithModule } from '../logger';
import { ServerContext } from '../types';
import { Config } from './config';

export class ExchangeProviderManager {
  private cells: Cell[] = [];
  private initiated: boolean;
  private config!: Config;
  private context!: ServerContext;
  private readonly logger = loggerWithModule('ExchangeProviderManager');

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

  assertInitiated(): void {
    if (!this.initiated) {
      throw new Error('ExchangeProviderManager is not initiated');
    }
  }

  private async refreshCells(needCapacity?: BigNumber): Promise<void> {
    this.assertInitiated();

    const cells = await this.context.ckitProvider.collectCells(
      {
        searchKey: {
          script_type: 'lock',
          script: this.context.ckitProvider.parseToScript(this.context.exchangeSigner!.getAddress()),
          filter: {
            script: this.context.ckitProvider.newScript('SUDT', this.config.sudtArgs),
          },
        },
      },
      () => true,
    );

    if (cells.length < this.config.exchangeCellCount) {
      await this.createProviderCells(this.config.exchangeCellCount - cells.length);
      await this.refreshCells();
    } else {
      if (needCapacity) {
        let currentCapacity = BigNumber.from(0);

        for (const cell of cells) {
          currentCapacity = currentCapacity.add(cell.cell_output.capacity);
          if (currentCapacity.gte(needCapacity)) {
            break;
          }
        }

        if (currentCapacity.lt(needCapacity)) {
          try {
            await this.createProviderCells(
              needCapacity.sub(currentCapacity).div(this.config.initCapacity).add(1).toNumber(),
            );
          } catch (e) {
            this.logger.error(e);
            throw e;
          }

          await this.refreshCells();
        }
      } else {
        this.cells = cells.sort((a, b) =>
          BigNumber.from(b.block_number).sub(BigNumber.from(a.block_number)).toNumber(),
        );
      }
    }
  }

  private async createProviderCells(amount: number): Promise<void> {
    this.assertInitiated();

    const builder = new AcpTransferSudtBuilder(
      {
        allowDuplicateRecipient: true,
        recipients: Array.from({ length: amount }).map(() => {
          return {
            recipient: this.context.exchangeSigner!.getAddress(),
            sudt: this.context.ckitProvider.newScript('SUDT', this.config.sudtArgs),
            amount: bytes.hexify(number.Uint128.pack(0)),
            policy: 'createCell',
            additionalCapacity: BigNumber.from(this.config.initCapacity).toHexString(),
          };
        }),
      },
      this.context.ckitProvider,
      this.context.txSigner.getAddress(),
    );
    try {
      const unsignedTx = await builder.build();
      const tx = await this.context.txSigner.seal(unsignedTx);
      const hash = await this.context.ckitProvider.sendTransaction(tx);
      await this.context.ckitProvider.waitForTransactionCommitted(hash);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async initiateConfig(config: Config, context: ServerContext): Promise<void> {
    this.config = config;
    this.context = context;
    this.initiated = true;

    await this.refreshCells();
  }

  calcExchangableCkbAmount(sudtAmount: HexString): BigNumber {
    return BigNumber.from(sudtAmount)
      .mul(this.config.exchange.pairedQuoteCKBPrice)
      .div(this.config.exchange.pairedBaseSUDTPrice);
  }

  exchangeAmountReachLimitation(amount: BigNumber): boolean {
    return amount.gt(this.config.exchange.maxCapacityPerExchange) && this.config.exchange.maxCapacityPerExchange.gt(0);
  }

  async getLeagalCells(sudtAmount: HexString): Promise<Cell[]> {
    this.assertInitiated();

    let cells: Cell[] = [];
    const needCapacity = this.calcExchangableCkbAmount(sudtAmount).add(
      helpers.minimalCellCapacity({
        cell_output: {
          capacity: '0x10',
          lock: this.context.ckitProvider.parseToScript(this.context.exchangeSigner!.getAddress()),
          type: this.context.ckitProvider.newScript('SUDT', this.config.sudtArgs),
        },
        data: bytes.hexify(number.Uint128.pack(0)),
      }),
    );

    if (this.exchangeAmountReachLimitation(needCapacity)) {
      throw new Error('exchange CKB reach limitation');
    }

    let capacity = BigNumber.from(0);

    while (capacity.lt(needCapacity)) {
      const cell = this.cells.shift();

      if (cell == undefined) {
        await this.refreshCells(needCapacity);
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
