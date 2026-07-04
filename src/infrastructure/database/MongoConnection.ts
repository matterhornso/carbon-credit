import mongoose from "mongoose";
import * as Q from "q";
import _ from "underscore";
import logger from "../../interfaces/utils/Logger";

export class MongoConnection {
  constructor() {
    let mongo_url: string;
    if (process.env.MONGODB_URI) {
      mongo_url =
        process.env.MONGODB_URI +
        "/" +
        process.env.DB_NAME +
        "?authSource=admin"; // replicaSet=staging-rs0
    } else if (process.env.ENVIRONMENT?.toString().includes("dev")) {
      // mongo_url = process.env.MONGODB_HOST + ":" + process.env.MONGODB_PORT + "/" + process.env.DB_NAME;
      mongo_url =
        "mongodb://" +
        process.env.DB_USER +
        ":" +
        process.env.DB_PASS +
        "@" +
        process.env.MONGODB_HOST +
        ":" +
        process.env.MONGODB_PORT +
        "/" +
        process.env.DB_NAME +
        "?authSource=admin";
    } else if (process.env.ENVIRONMENT?.toString().includes("test")) {
      mongo_url = process.env.MONGODB_HOST + "/" + process.env.DB_NAME;
    } else {
      mongo_url =
        "mongodb://" +
        process.env.DB_USER +
        ":" +
        process.env.DB_PASS +
        "@" +
        process.env.MONGODB_HOST +
        ":" +
        process.env.MONGODB_PORT +
        "/" +
        process.env.DB_NAME +
        "?authSource=admin";
    }
    mongoose
      .connect(mongo_url)
      .then(() => {
        logger.info(
          "MongoDB connection successful at " +
          new Date() +
          " , url " +
          mongo_url
        );
      })
      .catch((err: string) => {
        console.log(
          "MongoDB connection error. Please make sure MongoDB is running. " +
          err
        );
      });



    // CONNECTION EVENTS
    // When successfully connected
    mongoose.connection.on('connected', () => {
      console.log('Mongoose default connection open to ' + mongo_url);
    });

    // If the connection throws an error
    mongoose.connection.on('error', (err) => {
      console.log('Mongoose default connection error: ' + err);
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose default connection disconnected');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
      });
    });
    return;
  }

}