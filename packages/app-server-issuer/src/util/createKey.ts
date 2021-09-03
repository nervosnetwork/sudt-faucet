import crypto from 'crypto';
interface KeyPair {
  publicKey: string;
  privateKey: string;
}
const genKeyPair = (): KeyPair => {
  // Generates an object where the keys are stored in properties `privateKey` and `publicKey`
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096, // bits - standard for RSA keys
    publicKeyEncoding: {
      type: 'pkcs1', // "Public Key Cryptography Standards 1"
      format: 'pem', // Most common formatting choice
    },
    privateKeyEncoding: {
      type: 'pkcs1', // "Public Key Cryptography Standards 1"
      format: 'pem', // Most common formatting choice
    },
  });
};

export { genKeyPair, KeyPair };
