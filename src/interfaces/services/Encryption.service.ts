import * as SuperAgent from "superagent"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.NODE_TLS_ACCEPT_UNTRUSTED_CERTIFICATES_THIS_IS_INSECURE = '1'

let ENCRYPTION_SERVICE_URL = process.env.ENCRYPTION_SERVICE_URL || 'http://localhost:3004';


export class EncryptionService {
  constructor() { }

  encryptData(data: any, keys: string[]): any {
    return new Promise((resolve, reject) => {
      if (!data) reject(new Error('data missing'));
      if (!keys) reject(new Error('keys missing'));

      data = JSON.stringify(data);

      SuperAgent
        .post(ENCRYPTION_SERVICE_URL + '/encryption/api/v1/encryption/encryptData')
        .send({
          data,
          keys
        })
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the Encryption Service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the Encryption Service, err: ' + err));
          if (res.body.success == true) return resolve(res.body.data);
          return reject(new Error('An error occurred while encrypting data!')); // TODO think
        });
    });
  }
}