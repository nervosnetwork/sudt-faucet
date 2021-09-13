export function read<T = string>(key: string, defaults: T, parse: (x: string) => T): T {
  const val = process.env[key];
  return val ? parse(val) : defaults;
}

export function readAsNum(key: string, defaults: number): number {
  return read(key, defaults, Number);
}

export function readAsStr(key: string, defaults: string): string {
  return read(key, defaults, String);
}
