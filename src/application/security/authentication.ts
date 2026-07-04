import * as express from 'express';
import { AuthService } from '../../interfaces/services/Auth.service';
// import { AuthService } from "../../interfaces/services/Auth.service";
import logger from '../../interfaces/utils/Logger';

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    if (securityName != "jwt") return reject(new Error("No token provided"));;

    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return reject(new Error("No token provided"));
    }

    let authService = new AuthService();
    let userInfo = await authService.verifyToken(token).catch((error: any) => logger.error(error.stack))
    if (!userInfo || !userInfo.data) {
      return reject("jwt, no user info found");
    }
    console.log(userInfo, "userInfo")
    request.headers["_user_uuid"] = userInfo.data.uuid;
    resolve({ valid: true, _user_uuid: userInfo.data.uuid, jwtToken: token });
  });
}