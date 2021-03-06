import detectEthereumProvider from '@metamask/detect-provider';
import * as ethUtil from 'ethereumjs-util';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { LoginMessage } from './types';

interface EthereumProvider {
  selectedAddress: string;
  isMetaMask?: boolean;
  enable: () => Promise<string[]>;
  addListener: (event: 'accountsChanged', listener: (addresses: string[]) => void) => void;
  removeEventListener: (event: 'accountsChanged', listener: (addresses: string[]) => void) => void;
  request: (payload: { method: 'personal_sign'; params: [string /*from*/, string /*message*/] }) => Promise<string>;
}

function detect(): Promise<EthereumProvider> {
  return detectEthereumProvider().then(() => window.ethereum as EthereumProvider);
}

const createLoginMessage = async (message: string): Promise<LoginMessage> => {
  const ethProvider = await detect();
  const from = ethProvider.selectedAddress;
  await ethProvider.enable();
  const signature = await ethProvider.request({ method: 'personal_sign', params: [from, message] });
  return { signature, address: from };
};

const verifyLoginMessage = async (signature: string, message: string, address: string): Promise<boolean> => {
  const data = ethUtil.fromUtf8(message);
  const messageHash = ethUtil.hashPersonalMessage(ethUtil.toBuffer(data));
  const sigDecoded = ethUtil.fromRpcSig(signature);
  const recoveredPub = ethUtil.ecrecover(messageHash, sigDecoded.v, sigDecoded.r, sigDecoded.s);
  const recoveredAddress = '0x' + ethUtil.pubToAddress(recoveredPub).toString('hex');
  return recoveredAddress.toLocaleLowerCase() === address.toLocaleLowerCase();
};

const createToken = (message: string, privateKey: string): string => {
  const INTEGER_REGEX = /^\d+$/;
  const loginTime = message.split(':')[1];
  if (!loginTime || !INTEGER_REGEX.test(loginTime)) {
    throw new Error('login message error');
  }
  const exp = Math.floor(parseInt(loginTime) / 1000) + 60 * 60;
  return jwt.sign({ data: message, exp }, privateKey, { algorithm: 'RS256' });
};

const verifyToken = (token: string, publicKey: string): string | JwtPayload => {
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
};

export { createToken, verifyToken, verifyLoginMessage, createLoginMessage };
