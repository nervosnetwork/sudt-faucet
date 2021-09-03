import detectEthereumProvider from '@metamask/detect-provider';
import jwt, { JwtPayload } from 'jsonwebtoken';
import * as ethUtil from 'ethereumjs-util';
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
  return recoveredAddress === address;
};

const createToken = (address: string, privateKey: string): string => {
  return jwt.sign({ address }, privateKey, { expiresIn: '1h', algorithm: 'RS256' });
};

const verifyToken = (token: string, publicKey: string): string => {
  const result = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;
  return result.address;
};

export { createToken, verifyToken, verifyLoginMessage, createLoginMessage };
