import path from 'path';

export * from './AssetAmount';

export const PROJECT_PATH = path.join(__dirname, '/../..');

export function nonNullable(condition: unknown, name = 'The variable'): asserts condition {
  if (!condition) throw new Error(`${name} cannot be nil`);
}
