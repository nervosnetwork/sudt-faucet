import { BigNumber } from 'ethers';

export interface Config {
  exchangeCellCount: number;
  sudtArgs: string;
  initCapacity: number;
  exchange: ExchangeConfig;
}

export interface ExchangeConfig {
  sUDT: BigNumber;
  CKB: BigNumber;
}
