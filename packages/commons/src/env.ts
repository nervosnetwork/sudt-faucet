export function read<T = string>(key: string, parse: (x: string) => T, defaults?: T): T {
  const val = process.env[key];

  if (val !== undefined) return parse(val);

  if (defaults !== undefined) return defaults;

  throw new Error(`Cannot find ${key} in environment variables`);
}

export function readAsNum(key: string, defaults?: number): number {
  return read(key, Number, defaults);
}

export function readAsStr(key: string, defaults?: string): string {
  return read(key, String, defaults);
}
