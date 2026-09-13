import dotenv from "dotenv";
import errorHandler from "errorhandler";
import path from "path";
import app from "./router";

// import * as https from 'https';
// import * as fs from 'fs';

// const certificate = fs.readFileSync(path.resolve(__dirname, `../certs/cert.cert`));
// const privateKey = fs.readFileSync(path.resolve(__dirname, `../certs/cert.key`));

// change environment after api-gateway implementation
// dotenv.config({
//   path: path.resolve(__dirname, `../env/${process.env.ENVIRONMENT}.env`)
// });

import { RegisterRoutes } from './routes/routes';
import { JobWorker } from '../application/usecases/job/JobWorker';

if (process.env.NODE_ENV === 'dev') {
  // only use in development
  app.use(errorHandler())
}

RegisterRoutes(app);

// const credentials = { key: privateKey, cert: certificate };

// const httpsServer = https.createServer(credentials, app);

// httpsServer.listen(app.get("port"), () => console.log(`Server started listening to port ${app.get("port")}`));

/**
 * Start Express server.
 */
// Background work starts with the server: the job worker polls for queued
// runs so generation continues whether or not anyone is watching a browser.
new JobWorker().start();

const server = app.listen(app.get("port"), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;