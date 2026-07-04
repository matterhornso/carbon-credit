import * as SuperAgent from "superagent"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.NODE_TLS_ACCEPT_UNTRUSTED_CERTIFICATES_THIS_IS_INSECURE = '1'

let NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005';


export class NotificationService {
  constructor() { }

  // TODO jwttoken
  sendPushNotification(receipt: any, type: string, sender: string, device: string, jwtToken: string, extra_data: any, subject: any = '', messageBody: any = ''): any {
    return new Promise((resolve, reject) => {
      if (!receipt) reject(new Error('receipt missing'));
      if (!jwtToken) return reject(new Error("jwtToken missing"));
      SuperAgent
        .post(NOTIFICATION_SERVICE_URL + '/notification/api/v1/notification/sendNotification')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({
          receipt,
          extra_data,
          type,
          sender,
          device,
          subject,
          messageBody
        })
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            console.log('An error occurred with the notification service, err:', err)
          }
          if (!res || !res.body) console.log('An error occurred with the notification service, err:', err)
          resolve(res.body);
        });
    });
  }
}
