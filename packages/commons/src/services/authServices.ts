import fs from 'fs';
import path from 'path';
import detectEthereumProvider from '@metamask/detect-provider';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Web3 from 'web3';
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
  const web3 = new Web3(Web3.givenProvider);
  const signingAddress = await web3.eth.personal.ecRecover(message, signature);
  return signingAddress === address;
};

const createToken = (address: string): string => {
  const rsaPath = path.resolve(__dirname, '../assets');
  const PRIV_KEY = fs.readFileSync(rsaPath + '/id_rsa_priv.pem', 'utf8');
  const payload = { address };
  const token = jwt.sign(payload, PRIV_KEY, { expiresIn: '1h', algorithm: 'RS256' });
  return token;
};

const verifyToken = (token: string): JwtPayload | string => {
  const rsaPath = path.resolve(__dirname, '../assets');
  const PUB_KEY = fs.readFileSync(rsaPath + '/id_rsa_pub.pem', 'utf8');
  const result = jwt.verify(token, PUB_KEY, { algorithms: ['RS256'] });
  return result;
};

export { createToken, verifyToken, verifyLoginMessage, createLoginMessage };
