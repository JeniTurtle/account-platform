import * as bcryptTools from 'bcrypt';
import * as CryptoJS from 'crypto-js';

export const bcrypt = {
  saltRounds: 10,
  hash: (password: string) => {
    return bcryptTools.hashSync(password, bcrypt.saltRounds);
  },
  compare: (password: string, EncryptedPassword: string) => {
    return bcryptTools.compareSync(password, EncryptedPassword);
  },
};

export const crypto = {
  decrypt(word) {
    const keyStr = 'k;)*(+nmjdsf$#@d';
    const key = CryptoJS.enc.Utf8.parse(keyStr); // Latin1 w8m31+Yy/Nw6thPsMpO5fg==
    return CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
  },
};
