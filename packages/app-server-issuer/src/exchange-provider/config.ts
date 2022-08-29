import { BI as BigNumber } from '@ckb-lumos/lumos';

export interface Config {
  exchangeCellCount: number;
  sudtArgs: string;
  initCapacity: BigNumber;
  exchange: ExchangeConfig;
}

export interface ExchangeConfig {
  pairedBaseSUDTPrice: BigNumber;
  pairedQuoteCKBPrice: BigNumber;
  maxCapacityPerExchange: BigNumber;
}
