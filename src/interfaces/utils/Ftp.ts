
import fs from "fs";
import os from "os";
// import Client from "ftp";
import Client from "ssh2-sftp-client";

export class Ftp {
  host = process.env.SFTPIP;
  port = process.env.SFTPPORT;
  username = process.env.SFTP_USERNAME;
  password = process.env.SFTP_PASSWORD;
  logger_username = process.env.LOGGER_SFTP_USERNAME;
  logger_password = process.env.LOGGER_SFTP_PASSWORD;
  constructor() {

  }

  uploadLoadFile(path: string, filename: string) {
    console.log(path, filename, "fileString")
    return new Promise<any>(async (resolve, reject) => {
      let client = new Client();
      let config: any = {
        host: this.host,
        port: this.port,
        username: this.username,
        password: this.password,
      }
      // let path = fs.createReadStream('/path/to/local/file.txt');
      let remotePath = '/files/' + filename;
      client.connect(config)
        .then(() => {
          return client.put(path, remotePath);
        })
        .then(() => {
          client.end();
          resolve(true)
        })
        .catch(err => {
          console.log(err.message);
        });
    })
  }

  getFile(filename: string) {
    return new Promise<any>(async (resolve, reject) => {
      let client = new Client();
      let remotePath = '/files/' + filename;
      let dst = fs.createWriteStream(os.tmpdir() + "/" + filename);
      let config: any = {
        host: this.host,
        port: this.port,
        username: this.username,
        password: this.password,
      }
      client.connect(config)
        .then(() => {
          return client.get(remotePath, dst);
        })
        .then(() => {
          client.end();
          let downloadFile = os.tmpdir() + "/" + filename;
          resolve(downloadFile)
        })
        .catch((err: any) => {
          console.error(err.message);
        });
    });
  }

  uploadLog(path: string, filename: string) {
    return new Promise<any>(async (resolve, reject) => {
      let client = new Client();
      let config: any = {
        host: this.host,
        port: this.port,
        username: this.logger_username,
        password: this.logger_password,
      }
      console.log("PATH:", path);
      let remotePath = `nse-shine-dev/carbon-credit/` + filename;
      console.log("REMOTE", remotePath);
      client.connect(config)
        .then(() => {
          return client.put(path, remotePath);
        })
        .then(() => {
          client.end();
          resolve(true)
        })
        .catch(err => {
          console.log(err.message)
        });
    })
  }
}