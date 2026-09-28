import { expect } from 'chai';
import { LLMService } from '../../interfaces/services/LLM.service';

/**
 * Provider settings are read from the environment at call time, so each case
 * sets LLM_* itself and restores the originals afterwards. The HTTP layer is
 * replaced on the instance, so nothing leaves the process.
 */
describe('LLMService config resolution', () => {
  const VARS = ['LLM_API_KEY', 'LLM_BASE_URL', 'LLM_MODEL'] as const;
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const v of VARS) saved[v] = process.env[v];
  });
  afterEach(() => {
    for (const v of VARS) {
      if (saved[v] === undefined) delete process.env[v];
      else process.env[v] = saved[v];
    }
  });

  function stubbed() {
    const svc = new LLMService();
    const calls: { baseUrl: string; body: { model: string } }[] = [];
    (svc as any)._request = async (baseUrl: string, _apiKey: string, body: string) => {
      calls.push({ baseUrl, body: JSON.parse(body) });
      return { content: '{}', model: 'stub', finishReason: 'stop', promptTokens: 0, completionTokens: 0 };
    };
    return { svc, calls };
  }

  it('falls back to the default model when LLM_MODEL is present but empty', async () => {
    // An empty config file (or an empty Railway variable) must not be sent as model "".
    process.env['LLM_API_KEY'] = 'test-key';
    process.env['LLM_MODEL'] = '';
    delete process.env['LLM_BASE_URL'];
    const { svc, calls } = stubbed();
    await svc.chatCompletion([{ role: 'user', content: 'hi' }]);
    expect(calls).to.have.length(1);
    expect(calls[0].body.model).to.be.a('string').that.is.not.empty;
    expect(calls[0].baseUrl).to.match(/^https:\/\/[^/]+\/v1$/);
  });

  it('uses LLM_MODEL and LLM_BASE_URL when they are set', async () => {
    process.env['LLM_API_KEY'] = 'test-key';
    process.env['LLM_MODEL'] = 'vendor/some-model';
    process.env['LLM_BASE_URL'] = 'https://example.test/v1';
    const { svc, calls } = stubbed();
    await svc.chatCompletion([{ role: 'user', content: 'hi' }]);
    expect(calls[0].body.model).to.equal('vendor/some-model');
    expect(calls[0].baseUrl).to.equal('https://example.test/v1');
  });

  it('refuses to call out without a key', async () => {
    delete process.env['LLM_API_KEY'];
    const { svc, calls } = stubbed();
    let error: Error | undefined;
    try {
      await svc.chatCompletion([{ role: 'user', content: 'hi' }]);
    } catch (e: any) {
      error = e;
    }
    expect(error?.message).to.match(/LLM_API_KEY/);
    expect(calls).to.have.length(0);
  });
});
