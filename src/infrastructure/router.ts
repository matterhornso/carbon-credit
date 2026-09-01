import express, { Response as ExResponse, Request as ExRequest } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import onFinished from "on-finished";
import swaggerUi from "swagger-ui-express";
import logger from '../interfaces/utils/Logger';
import * as client from 'prom-client';
import helmet from "helmet";
import { MongoConnection } from "./database/MongoConnection";
const cors = require('cors');

dotenv.config({
  path: path.resolve(__dirname, `../env/${process.env.ENVIRONMENT}.env`)
});

// Create Express server
const router = express();
router.disable("x-powered-by");
// Express configuration
router.set("port", process.env.PORT || 4001);
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors({
  origin: ["https://shine-uat.nseindia.com", "https://nse-dev.shinetrace.space", "http://localhost:3000", "http://localhost:3700"]
}));
router.use(helmet());
// Create a Registry which registers the metrics
const register = new client.Registry()

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'carbon-credit'
})

// Enable the collection of default metrics
client.collectDefaultMetrics({ register })
new MongoConnection();
router.get("/metrics", async function (req, res, next) {
  logger.debug("route, new request path " + req.path);
  res.setHeader('Content-Type', register.contentType);
  return res.end(await register.metrics()); // Return all metrics the Prometheus exposition format
});

router.get("/", function (req, res, next) {
  logger.debug("route, new request path " + req.path);
  return res.status(200).json({ status: "carbon credit  server is Working!" });
});

router.get("/healthz", function (req, res, next) {
  logger.debug("route, new request path " + req.path);
  return res.status(200).json({ status: "carbon credit server is health is good Working!" });
});

router.get("/livez", function (req, res, next) {
  logger.debug("route, new request path " + req.path);
  return res.status(200).json({ status: "carbon credit server livez!" });
});

router.get("/readyz", function (req, res, next) {
  logger.debug("route, new request path " + req.path);
  // readyState 1 === connected. Report NOT ready without a live DB so k8s
  // keeps traffic away instead of routing it into guaranteed 500s.
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ status: "not ready: database unavailable" });
  }
  return res.status(200).json({ status: "ready" });
});

router.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  logger.debug("route, new request path " + _req.path);
  return res.send(
    swaggerUi.generateHTML(await import("../../api/dist/swagger.json"))
  );
});

router.use(async function (req, res: any, next) {
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks: Uint8Array[] | Buffer[] = [];
  res.write = (...restArgs: any) => {
    chunks.push(Buffer.from(restArgs[0]));
    oldWrite.apply(res, restArgs);
  };
  res.end = (...restArgs: any) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    if (res.statusCode >= 500) {
      logger.error(JSON.stringify({
        time: new Date().toUTCString(),
        fromIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        method: req.method,
        originalUri: req.originalUrl,
        uri: req.url,
        requestData: req.body,
        responseData: body,
        responseStatus: res.statusCode,
        referer: req.headers.referer || '',
        ua: req.headers['user-agent'],
        authorization: req.headers['authorization'],
        _user_uuid: req.headers['_user_uuid'],
        host: req.headers['host']
      }));
    } else {
      logger.info(JSON.stringify({
        time: new Date().toUTCString(),
        fromIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        method: req.method,
        originalUri: req.originalUrl,
        uri: req.url,
        requestData: req.body,
        responseData: body,
        responseStatus: res.statusCode,
        referer: req.headers.referer || '',
        ua: req.headers['user-agent'],
        authorization: req.headers['authorization'],
        _user_uuid: req.headers['_user_uuid'],
        host: req.headers['host']
      }));
    }

    oldEnd.apply(res, restArgs);
  };

  next();
});

export default router;
