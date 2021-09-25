export * from './AssetAmount';

export function nonNullable(condition: unknown, name = 'The variable'): asserts condition {
  if (!condition) throw new Error(`${name} cannot be nil`);
}
