import * as SuperAgent from "superagent"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.NODE_TLS_ACCEPT_UNTRUSTED_CERTIFICATES_THIS_IS_INSECURE = '1'

let AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export class AuthService {
  constructor() { }

  verifyToken(token: string): any {
    return new Promise((resolve, reject) => {
      if (!token) reject(new Error('token missing'));
      SuperAgent
        .post(AUTH_SERVICE_URL + '/auth/api/v1/auth/verifyToken')
        .send({
          token: token
        })
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the auth service, err: ' + err));
          }
          // TODO handle
          //console.log("verifyToken", res.body);
          resolve(res.body);
        });
    });
  }

  verifyCaptcha(captcha: string, id: string): any {
    return new Promise((resolve, reject) => {
      if (!captcha) reject(new Error('captcha missing'));
      if (!id) reject(new Error('id missing'));
      SuperAgent
        .get(AUTH_SERVICE_URL + '/auth/api/v1/auth/verifyCaptcha')
        .query({ captcha: captcha, id: id })
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the auth service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the auth service, err: ' + err));
          resolve(res.body);
        });
    });
  }
}
