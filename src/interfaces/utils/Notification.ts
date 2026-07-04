import { NotificationService } from "../services/Notification.service";
import { UserService } from "../services/User.service";

export class Notification {
  constructor() { }

  async sendMailNotification(data: any) {
    console.log('inside notification', data)
    let receipt = [];
    let receiptLab = [];
    let type = data.type;
    let sender = '';
    let device = 'web';
    let jwtToken = data.jwtToken;
    let extra_data: any;
    let subject = '';
    let messageBody = '';
    let date = new Date();

    if (data.type === 'refinerImported') {
      subject = 'Refiner have imported  the gold';
      extra_data = { action: 'Gold imported by Refiner', uin: data.uin, refiner: data.refiner?.fullName, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      messageBody = "Refiner imported gold and Generate UIN : " + data.uin + " " + process.env.MAIL_NOTIFY_URL + data.uin;
      let adminUsers = await new UserService().getUsersByOrgType('admin', data.jwtToken)
      if (adminUsers.success) {
        let temp = adminUsers.data;
        for (let i = 0; i < temp.length; i++) {
          receipt.push(temp[i].email)
        }
        await new NotificationService().sendPushNotification(
          JSON.stringify(receipt),
          type,
          sender,
          device,
          jwtToken,
          extra_data,
          subject,
          messageBody)
      }

    }
    else if (data.type === 'goldbarCaptured') {
      subject = 'Gold Bar Captured';
      extra_data = { action: 'Gold Bar Captured', uin: data.uin, refiner: data.refiner?.fullName, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      messageBody = "Gold Bar Captured " + data.uin + " " + process.env.MAIL_NOTIFY_URL + data.uin;
      let adminUsers = await new UserService().getUsersByOrgType('admin', data.jwtToken)
      if (adminUsers.success) {
        let temp = adminUsers.data;
        for (let i = 0; i < temp.length; i++) {
          receipt.push(temp[i].email)
        }
        await new NotificationService().sendPushNotification(
          JSON.stringify(receipt),
          type,
          sender,
          device,
          jwtToken,
          extra_data,
          subject,
          messageBody)
      }
    } else if (data.type === 'nseSampleRequest') {
      subject = 'NSE Assign sample limit per batch';
      extra_data = { action: 'Sample limit updated by NSE', uin: data.uin, refiner: data.refiner, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      messageBody = "NSE Assign sample limit per batch URN :  " + data.urn + " " + process.env.MAIL_NOTIFY_URL + data.uin;
      let _user = await new UserService().getUsersById(data.refiner, data.jwtToken);
      receipt.push(_user.data.email)
      await new NotificationService().sendPushNotification(
        JSON.stringify(receipt),
        type,
        sender,
        device,
        jwtToken,
        extra_data,
        subject,
        messageBody)
    } else if (data.type === 'refinerToLab') {
      subject = 'Refiner sent sample to lab';
      extra_data = { action: 'Samples sent to lab for testing', uin: data.uin, refiner: data.refiner, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      let extra_data_lab = { action: 'Samples sent to lab for testing', urn: data.urn, refiner: data.refiner, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      messageBody = "Refiner sent sample to lab  " + " " + process.env.MAIL_NOTIFY_URL + data.uin;
      let adminUsers = await new UserService().getUsersByOrgType('admin', data.jwtToken)
      let labUsers = await new UserService().getUsersByOrgType('lab', data.jwtToken)
      if (adminUsers.success && labUsers.success) {
        let temp = adminUsers.data;
        let tempLab = labUsers.data;
        for (let i = 0; i < temp.length; i++) {
          receiptLab.push(temp[i].email)
        }
        for (let i = 0; i < tempLab.length; i++) {
          receiptLab.push(tempLab[i].email)
        }
        await new NotificationService().sendPushNotification(
          JSON.stringify(receiptLab),
          type,
          sender,
          device,
          jwtToken,
          extra_data_lab,
          subject,
          messageBody)
      }
    } else if (data.type === 'labReceive') {
      //TODO notify refiner
      subject = 'Lab receive sample';
      extra_data = { action: 'Sample received by Lab', uin: data.uin, refiner: data.refiner, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      messageBody = "Lab confirm receive sample  " + " " + process.env.MAIL_NOTIFY_URL + data.uin;
      let _user = await new UserService().getUsersById(data.refiner._id, data.jwtToken);
      receipt.push(_user.data.email)
      let adminUsers = await new UserService().getUsersByOrgType('admin', data.jwtToken)
      let labUsers = await new UserService().getUsersByOrgType('lab', data.jwtToken)
      if (adminUsers.success && labUsers.success) {
        let temp = adminUsers.data;
        let tempLab = labUsers.data;
        for (let i = 0; i < temp.length; i++) {
          receipt.push(temp[i].email)
        }
        // for (let i = 0; i < tempLab.length; i++) {
        //   receipt.push(tempLab[i].email)
        // }
        await new NotificationService().sendPushNotification(
          JSON.stringify(receipt),
          type,
          sender,
          device,
          jwtToken,
          extra_data,
          subject,
          messageBody)
      }
    }
    else if (data.type === 'labTestResult') {
      //TODO notify refiner
      subject = 'Lab generate test result';
      extra_data = { action: 'Testing sample done by LAB', uin: data.uin, refiner: data.refiner, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      messageBody = "Lab generate test result  " + " " + process.env.MAIL_NOTIFY_URL + data.uin;
      let adminUsers = await new UserService().getUsersByOrgType('admin', data.jwtToken)
      let labUsers = await new UserService().getUsersByOrgType('lab', data.jwtToken)
      if (adminUsers.success && labUsers.success) {
        let temp = adminUsers.data;
        let tempLab = labUsers.data;
        for (let i = 0; i < temp.length; i++) {
          receipt.push(temp[i].email)
        }
        // for (let i = 0; i < tempLab.length; i++) {
        //   receipt.push(tempLab[i].email)
        // }
        await new NotificationService().sendPushNotification(
          JSON.stringify(receipt),
          type,
          sender,
          device,
          jwtToken,
          extra_data,
          subject,
          messageBody)
      }
    }
    else if (data.type === 'nseSettlement') {
      subject = 'NSE Settled the gold bar';
      extra_data = { action: 'Batch & Bars accepted for settlement', uin: data.uin, refiner: data.refiner, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      let extra_data_lab = { action: 'Batch & Bars accepted for settlement', urn: data.urn, refiner: data.refiner, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      messageBody = "NSE Settle the gold bar" + " " + process.env.MAIL_NOTIFY_URL + data.uin;
      let _user = await new UserService().getUsersById(data.refiner._id, data.jwtToken);
      receiptLab.push(_user.data.email)
      let adminUsers = await new UserService().getUsersByOrgType('admin', data.jwtToken)
      let labUsers = await new UserService().getUsersByOrgType('lab', data.jwtToken)
      if (adminUsers.success && labUsers.success) {
        let temp = adminUsers.data;
        let tempLab = labUsers.data;
        for (let i = 0; i < temp.length; i++) {
          receipt.push(temp[i].email)
        }
        for (let i = 0; i < tempLab.length; i++) {
          receiptLab.push(tempLab[i].email)
        }
        await new NotificationService().sendPushNotification(
          JSON.stringify(receiptLab),
          type,
          sender,
          device,
          jwtToken,
          extra_data_lab,
          subject,
          messageBody)
      }
    }
    else if (data.type === 'LAB_RETURN_SAMPLE') {
      subject = 'Lab return the sample to refiner';
      extra_data = { action: 'Sample returned to refiner', uin: data.uin, refiner: data.refiner, link: process.env.MAIL_NOTIFY_URL + data.uin, time: date.toString() }
      messageBody = "Lab return the sample to refiner" + " " + process.env.MAIL_NOTIFY_URL + data.uin;
      let _user = await new UserService().getUsersById(data.refiner._id, data.jwtToken);
      receipt.push(_user.data.email)
      let adminUsers = await new UserService().getUsersByOrgType('admin', data.jwtToken)
      let labUsers = await new UserService().getUsersByOrgType('lab', data.jwtToken)
      if (adminUsers.success && labUsers.success) {
        let temp = adminUsers.data;
        let tempLab = labUsers.data;
        for (let i = 0; i < temp.length; i++) {
          receipt.push(temp[i].email)
        }
        // for (let i = 0; i < tempLab.length; i++) {
        //   receipt.push(tempLab[i].email)
        // }
        await new NotificationService().sendPushNotification(
          JSON.stringify(receipt),
          type,
          sender,
          device,
          jwtToken,
          extra_data,
          subject,
          messageBody)
      }
    }
    else if (data.type === 'report') {
      subject = 'Report Generate';
      if (data.uin) {
        extra_data = { uin: data?.uin, source_type: data.source_type, sourcing_link: process.env.REPORT_URL + "=" + data.report.importUrl + "&token=" + data.jwtToken, goldbar_link: process.env.REPORT_URL + "=" + data.report.goldbarUrl + "&token=" + data.jwtToken }
      } else if (data.to) {
        extra_data = { to: data.to, from: data.from, sourcing_link: process.env.REPORT_URL + "=" + data.report.importUrl + "&token=" + data.jwtToken, goldbar_link: process.env.REPORT_URL + "=" + data.report.goldbarUrl + "&token=" + data.jwtToken }

      }
      messageBody = "Report Generated please click on link below" + "\n" + " " + process.env.REPORT_URL + "=" + data.report.importUrl + "&token=" + data.jwtToken + "\n \n \n" + process.env.REPORT_URL + "=" + data.report.goldbarUrl + "&token=" + data.jwtToken;
      await new NotificationService().sendPushNotification(
        JSON.stringify(data.receipt),
        type,
        sender,
        device,
        jwtToken,
        extra_data,
        subject,
        messageBody)
    }

  }
}
