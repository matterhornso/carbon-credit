import winston from "winston";
import { Ftp } from "./Ftp";
require('winston-daily-rotate-file')
const fs = require('fs');

const transports: any = winston.transports
const infoTransportOptionFile = new winston.transports.File({ filename: 'info.log', level: "info" });
const errorTransportOptionFile = new winston.transports.File({ filename: 'error.log', level: "error" });
const dailyRotateFileError = new transports.DailyRotateFile({
  filename: 'logs/' + process.env.npm_package_name + '-error-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH-mm',
  zippedArchive: true,
  maxSize: '5m',
  maxFiles: '5',
  level: "error",
  frequency: '5m'
});
const dailyRotateFileInfo = new transports.DailyRotateFile({
  filename: 'logs/' + process.env.npm_package_name + '-info-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH-mm',
  zippedArchive: true,
  maxSize: '5m',
  maxFiles: '5',
  level: "info",
  frequency: '30m'
});

const options: winston.LoggerOptions = {
  defaultMeta: { service: process.env.npm_package_name },
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
      )
    }),
    new winston.transports.Console({
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
      )
    }),
    dailyRotateFileInfo,
    dailyRotateFileError
  ]
};

dailyRotateFileError.on('rotate', function (oldFileName: any, newFilename: any) {
  console.log("-----Rotating Error file------");
  try {
    new Ftp().uploadLog(process.env.PWD + `/` + oldFileName + `.gz`, `${oldFileName}.gz`).then((res: any) => {
      console.log("-------Error Log file uploaded--------");
      fs.unlink(`./${oldFileName}.gz`, (err: any) => {
        //if (err) throw err;
        console.log(`error zip file: ${oldFileName}.gz successfully deleted`);
      });
    })
  } catch (Error: any) {
    throw Error;
  }

});

dailyRotateFileInfo.on('rotate', function (oldFileName: any, newFilename: any) {
  console.log("-----Rotating Info file-----");
  try {
    new Ftp().uploadLog(process.env.PWD + `/` + oldFileName + `.gz`, `${oldFileName}.gz`).then((res: any) => {
      console.log("-------Info Log file uploaded--------");
      fs.unlink(`./${oldFileName}.gz`, (err: any) => {
        //if (err) throw err;
        console.log(`info zip file: ${oldFileName}.gz successfully deleted`);
      });
    })
  } catch (Error: any) {
    throw Error;
  }

});


const logger = winston.createLogger(options);

// if (process.env.NODE_ENV !== "prod") {
//   logger.debug("Logging initialized at debug level");
// }

export default logger;