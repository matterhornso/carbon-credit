import * as express from 'express';
import { AuthService } from '../../interfaces/services/Auth.service';
import logger from '../../interfaces/utils/Logger';

/** A failure the generated routes answer with its own status, not with 500. */
export class AuthenticationError extends Error {
  public readonly status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * The user the auth service vouches for, or null.
 *
 * The auth service answers a token it could not verify with HTTP 200 and
 * `{ success: false, data: [] }`. An empty array is truthy, so a check that only
 * asked whether `data` existed accepted every token, real or invented, and let
 * the request through with no user attached to it. A response counts only if it
 * says it succeeded and names a user.
 */
export function verifiedUserUuid(userInfo: any): string | null {
  if (!userInfo || userInfo.success !== true) return null;
  const data = userInfo.data;
  if (!data || Array.isArray(data) || typeof data !== 'object') return null;
  return typeof data.uuid === 'string' && data.uuid.trim() ? data.uuid : null;
}

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    // Controllers read the caller's identity from this header. It is ours to set:
    // whatever the caller sent under that name is discarded before anything else.
    delete request.headers['_user_uuid'];

    if (securityName != 'jwt') return reject(new AuthenticationError('No token provided'));

    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return reject(new AuthenticationError('No token provided'));

    let userInfo: any;
    try {
      userInfo = await new AuthService().verifyToken(token);
    } catch (error: any) {
      logger.error(`token verification could not be completed: ${error?.message || String(error)}`);
      // Not a verdict on the token: the service that would give one did not answer.
      return reject(new AuthenticationError('The authentication service is unavailable', 503));
    }

    const uuid = verifiedUserUuid(userInfo);
    if (!uuid) return reject(new AuthenticationError('The token is not valid'));

    request.headers['_user_uuid'] = uuid;
    resolve({ valid: true, _user_uuid: uuid, jwtToken: token });
  });
}
