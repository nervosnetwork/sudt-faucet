/*
 * fixString(1.12345678,6) --> 1.123456
 * fixString(1.12345678,9) --> 1.123456780
 * fixString(12345678,1) --> 12345678
 *
 */
const fixString = (input: string, decimal: number): string => {
  const inputArray: string[] = input.split('.');
  if (inputArray.length === 1) return inputArray[0] || '';
  return `${inputArray[0]}.${(inputArray[1] as string).slice(0, decimal)}`;
};

/*
 * fixedStringToBigint(1.12345678,6) --> 1123456n
 * fixedStringToBigint(1.12345678,9) --> 1123456780n
 * fixedStringToBigint(12345678,1) --> 123456780n
 *
 */
const fixedStringToBigint = (input: string, decimal: number): bigint => {
  const decimalString = Array(decimal).fill('0').join('');
  const inputArray = input.split('.');
  inputArray[1] = inputArray[1] ? `${inputArray[1]}${decimalString}`.slice(0, decimal) : decimalString;
  return BigInt(inputArray.join(''));
};
/*
 * bigintToFixedString(1123456n,6) --> 1.123456
 * bigintToFixedString(1123456780n,9) --> 1.123456780
 * bigintToFixedString(123456780n,1) --> 12345678.0
 *
 */
const bigintToFixedString = (input: bigint, decimal: number): string => {
  const inputString = input.toString();
  return inputString.slice(0, 0 - decimal) + '.' + inputString.slice(0 - decimal);
};

export { fixedStringToBigint, bigintToFixedString, fixString };
