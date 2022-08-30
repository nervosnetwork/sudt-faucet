export interface SerializedTx {
  raw: Raw;
  witnessArgs: (WitnessArgsEntity | string)[];
  witnesses: string[];
}
export interface Raw {
  inputCells: InputCellsEntity[];
  outputs: OutputsEntity[];
  cellDeps: CellDepsEntity[];
  headerDeps: string[];
  version: string;
  inputs: InputsEntity[];
  outputsData?: string[];
}
export interface InputCellsEntity {
  capacity: Capacity;
  lock: LockOrType;
  type?: LockOrType;
  outPoint?: OutPointOrPreviousOutput;
  data: string;
}
export interface Capacity {
  amount: string;
}
export interface LockOrType {
  codeHash: string;
  args: string;
  hashType: string;
}
export interface OutPointOrPreviousOutput {
  txHash: string;
  index: string;
}
export interface OutputsEntity {
  capacity: Capacity;
  lock: LockOrType;
  data: string;
  type?: LockOrType;
}
export interface OutPointOrPreviousOutput1 {
  txHash: string;
  index: string;
}

export interface CellDepsEntity {
  depType: string;
  outPoint: OutPointOrPreviousOutput;
}
export interface InputsEntity {
  previousOutput: OutPointOrPreviousOutput;
  since: string;
}
export interface WitnessArgsEntity {
  lock: string;
  input_type: string;
  output_type: string;
}
