import { expect } from 'chai';
import { AuthService } from '../../interfaces/services/Auth.service';
import { expressAuthentication, verifiedUserUuid } from '../../application/security/authentication';

// What the auth service really sends back, copied from its Response class.
const VERIFIED = { success: true, error: [], statusCode: 200, data: { uuid: 'user-1' } };
const REFUSED = { success: false, statusCode: 500, error: 'no token found', data: [] };

describe('Test the authentication hook', () => {
  const original = AuthService.prototype.verifyToken;
  afterEach(() => {
    AuthService.prototype.verifyToken = original;
  });

  const authServiceAnswers = (body: any) => {
    AuthService.prototype.verifyToken = (() => Promise.resolve(body)) as any;
  };
  const request = (headers: Record<string, string> = {}): any => ({ headers: { ...headers } });
  const outcome = async (req: any, scheme = 'jwt') => {
    try {
      return { user: await expressAuthentication(req, scheme), error: undefined as any };
    } catch (error: any) {
      return { user: undefined as any, error };
    }
  };

  describe('verifiedUserUuid', () => {
    it('accepts a response that succeeded and names a user', () => {
      expect(verifiedUserUuid(VERIFIED)).to.equal('user-1');
    });

    it('refuses the failure response, whose data is an empty list', () => {
      expect(verifiedUserUuid(REFUSED)).to.equal(null);
    });

    it('refuses a success flag with no user behind it', () => {
      expect(verifiedUserUuid({ success: true, data: [] })).to.equal(null);
      expect(verifiedUserUuid({ success: true, data: {} })).to.equal(null);
      expect(verifiedUserUuid({ success: true, data: { uuid: '' } })).to.equal(null);
      expect(verifiedUserUuid({ success: true, data: { uuid: '   ' } })).to.equal(null);
      expect(verifiedUserUuid({ success: true, data: { uuid: 42 } })).to.equal(null);
      expect(verifiedUserUuid({ success: true, data: 'user-1' })).to.equal(null);
    });

    it('refuses a user that comes without the success flag', () => {
      expect(verifiedUserUuid({ data: { uuid: 'user-1' } })).to.equal(null);
      expect(verifiedUserUuid({ success: 'true', data: { uuid: 'user-1' } })).to.equal(null);
    });

    it('refuses an empty or malformed answer', () => {
      for (const answer of [null, undefined, '', 'ok', 0, [], {}]) {
        expect(verifiedUserUuid(answer)).to.equal(null);
      }
    });
  });

  describe('expressAuthentication', () => {
    it('lets a verified token through and records who it belongs to', async () => {
      authServiceAnswers(VERIFIED);
      const req = request({ authorization: 'Bearer a-real-token' });
      const { user, error } = await outcome(req);
      expect(error).to.equal(undefined);
      expect(user).to.include({ valid: true, _user_uuid: 'user-1', jwtToken: 'a-real-token' });
      expect(req.headers['_user_uuid']).to.equal('user-1');
    });

    it('refuses a token the auth service did not verify', async () => {
      authServiceAnswers(REFUSED);
      const req = request({ authorization: 'Bearer not-a-real-token' });
      const { user, error } = await outcome(req);
      expect(user).to.equal(undefined);
      expect(error).to.be.an.instanceOf(Error);
      expect(error.status).to.equal(401);
      expect(req.headers['_user_uuid']).to.equal(undefined);
    });

    it('discards an identity header the caller supplied, whatever the verdict', async () => {
      authServiceAnswers(REFUSED);
      const refused = request({ authorization: 'Bearer x', _user_uuid: 'someone-else' });
      expect((await outcome(refused)).error.status).to.equal(401);
      expect(refused.headers['_user_uuid']).to.equal(undefined);

      authServiceAnswers(VERIFIED);
      const verified = request({ authorization: 'Bearer y', _user_uuid: 'someone-else' });
      await outcome(verified);
      expect(verified.headers['_user_uuid']).to.equal('user-1');

      const noToken = request({ _user_uuid: 'someone-else' });
      await outcome(noToken);
      expect(noToken.headers['_user_uuid']).to.equal(undefined);
    });

    it('refuses, as an outage and not as a bad token, when the auth service cannot be reached', async () => {
      AuthService.prototype.verifyToken = (() => Promise.reject(new Error('connect ECONNREFUSED'))) as any;
      const { user, error } = await outcome(request({ authorization: 'Bearer a-real-token' }));
      expect(user).to.equal(undefined);
      expect(error.status).to.equal(503);
    });

    it('refuses a request with no token, without asking the auth service', async () => {
      let asked = false;
      AuthService.prototype.verifyToken = (() => { asked = true; return Promise.resolve(VERIFIED); }) as any;
      for (const headers of [{}, { authorization: '' }, { authorization: 'Bearer' }]) {
        const { user, error } = await outcome(request(headers as any));
        expect(user).to.equal(undefined);
        expect(error.status).to.equal(401);
      }
      expect(asked).to.equal(false);
    });

    it('refuses a security scheme it does not know', async () => {
      authServiceAnswers(VERIFIED);
      const { user, error } = await outcome(request({ authorization: 'Bearer a-real-token' }), 'api_key');
      expect(user).to.equal(undefined);
      expect(error.status).to.equal(401);
    });
  });
});
