import { Address, HexNumber } from '@ckb-lumos/base';
import { RcIdentity, SudtInfo, SudtStaticInfo, TypeId } from './types';

export interface CreateRcSudtOptions {
  rcIdentity: RcIdentity;
  info: SudtStaticInfo;
}

export interface IssueRcSudtOptions {
  sudtId: TypeId;
  amount: HexNumber;
  recipient: Address;
  capacityPolicy: 'createCell' | 'findAcp';
}

export interface RcUdtService<UnsignedTx = unknown> {
  buildUnsignedRcSudtInfoCellTx(options: CreateRcSudtOptions): Promise<UnsignedTx>;

  buildUnsignedRcIssueSudtTx(options: IssueRcSudtOptions): Promise<UnsignedTx>;

  listRcSudtInfo(): Promise<SudtInfo[]>;
}
