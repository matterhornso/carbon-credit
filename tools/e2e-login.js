#!/usr/bin/env node
//
// End-to-end login check: captcha -> password -> OTP -> JWT, against a running
// stack, with no browser involved.
//
// This exists because three separate login bugs — a stale API base URL, a
// password hashed differently from the way the client sends it, and a captcha
// mismatch that returned an empty response — were each found only when a person
// tried to log in and reported that it failed. Every fix cost a round trip
// through a human. This closes that loop.
//
// It reads the captcha and OTP straight from the database. That is legitimate
// here and only here: this is a test fixture driving a local stack, creating
// its own challenge and reading its own answer, not an attempt to defeat a
// challenge protecting anything.
//
//   node tools/e2e-login.js
//   BASE=http://localhost:3699 MONGO=mongodb://localhost:27017 node tools/e2e-login.js

const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require(path.join(__dirname, '..', '..', 'auth-service', 'node_modules', 'mongodb'));

const BASE = process.env.BASE || 'http://localhost:3699';
const MONGO = process.env.MONGO || 'mongodb://localhost:27017';
const AUTH_DB = process.env.AUTH_DB || 'auth_local';
const USER_DB = process.env.USER_DB || 'user_local';

const EMAIL = 'e2e-login-probe@example.test';
const PASSWORD = 'e2e-probe-password';
// The client MD5s the password before sending it, so the stored hash is pbkdf2
// over that digest. Getting this wrong produces an account that passes a direct
// API check and fails every real login.
const TRANSMITTED = crypto.createHash('md5').update(PASSWORD).digest('hex');

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const post = async (p, body) => {
  const r = await fetch(BASE + p, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  let json = null;
  try { json = await r.json(); } catch { /* an empty body is itself a finding */ }
  return { status: r.status, json };
};

(async () => {
  const client = await MongoClient.connect(MONGO);
  const auth = client.db(AUTH_DB);
  const users = client.db(USER_DB);

  try {
    // --- fixture -----------------------------------------------------------
    await users.collection('users').deleteMany({ email: EMAIL });
    let org = await users.collection('organizations').findOne({ name: 'e2e-probe-org' });
    if (!org) {
      const r = await users.collection('organizations').insertOne({
        uuid: crypto.randomUUID(), name: 'e2e-probe-org', type: 'ISSUER',
        about: 'probe', createdAt: new Date(), updatedAt: new Date(), __v: 0,
      });
      org = { _id: r.insertedId };
    }
    let dept = await users.collection('departments').findOne({ name: 'e2e-probe-dept' });
    if (!dept) {
      const r = await users.collection('departments').insertOne({
        uuid: crypto.randomUUID(), name: 'e2e-probe-dept', organization_id: org._id,
        about: 'probe', roles: ['ISSUER_role'], transactions: [],
        createdAt: new Date(), updatedAt: new Date(), __v: 0,
      });
      dept = { _id: r.insertedId };
    }
    const salt = crypto.randomBytes(16).toString('hex');
    await users.collection('users').insertOne({
      uuid: crypto.randomUUID(), fullName: 'E2E Probe', email: EMAIL, departmentId: dept._id,
      passwordHash: crypto.pbkdf2Sync(TRANSMITTED, salt, 1000, 64, 'sha512').toString('hex'),
      passwordSalt: salt, transactions: [], createdAt: new Date(), updatedAt: new Date(), __v: 0,
    });

    const newCaptcha = async () => {
      const id = 'e2e-' + crypto.randomUUID();
      const r = await fetch(`${BASE}/auth/api/v1/auth/getCaptcha?id=${id}`);
      if (!r.ok) throw new Error(`getCaptcha returned ${r.status}`);
      const row = await auth.collection('captchas').findOne({ id });
      if (!row) throw new Error('captcha was not persisted');
      return { id, value: row.captcha };
    };

    console.log(`\ne2e login against ${BASE}\n`);

    // --- the happy path ----------------------------------------------------
    const c1 = await newCaptcha();
    const login = await post('/auth/api/v1/auth/login', {
      email: EMAIL, password: TRANSMITTED, captcha: c1.value, id: c1.id,
    });
    check('login accepts a correct captcha and password', login.json?.success === true,
      login.json?.success ? '' : JSON.stringify(login.json?.error || login.json?.data || login.status));

    const loginId = login.json?.data?.id;
    check('login returns a session id to carry into OTP verification', !!loginId);

    let jwt = null;
    if (loginId) {
      // The OTP is stored on the auth session row in `auths`, keyed by
      // loginId — not in a separate otps collection.
      const otpRow = await auth.collection('auths').findOne({ loginId });
      check('an OTP was persisted for the session', !!otpRow);
      if (otpRow) {
        const verify = await post('/auth/api/v1/auth/verify-otp', { uuid: loginId, otp: String(otpRow.otp) });
        jwt = verify.json?.data?.jwtToken;
        check('verify-otp exchanges a correct code for a token', !!jwt,
          jwt ? '' : JSON.stringify(verify.json?.data || verify.json?.error || verify.status));
      }
    }

    // --- the failures that actually happened -------------------------------
    const c2 = await newCaptcha();
    const wrongPw = await post('/auth/api/v1/auth/login', {
      email: EMAIL, password: crypto.createHash('md5').update('not-the-password').digest('hex'),
      captcha: c2.value, id: c2.id,
    });
    check('a wrong password is rejected', wrongPw.json?.success === false);

    // Plaintext must fail: an account stored against the plaintext passes a
    // direct API check while every real login fails.
    const c3 = await newCaptcha();
    const plaintext = await post('/auth/api/v1/auth/login', {
      email: EMAIL, password: PASSWORD, captcha: c3.value, id: c3.id,
    });
    check('the plaintext password is rejected, proving the stored hash matches what the client sends',
      plaintext.json?.success === false);

    // This returned an empty body rather than an explanation.
    const c4 = await newCaptcha();
    const badCaptcha = await post('/auth/api/v1/auth/login', {
      email: EMAIL, password: TRANSMITTED, captcha: 'definitely-wrong', id: c4.id,
    });
    check('a wrong captcha is rejected with an explanation, not an empty response',
      badCaptcha.json?.success === false && typeof badCaptcha.json?.error !== 'undefined',
      JSON.stringify(badCaptcha.json));

    const stale = await post('/auth/api/v1/auth/login', {
      email: EMAIL, password: TRANSMITTED, captcha: 'anything', id: 'e2e-never-issued',
    });
    check('an unknown captcha id is rejected', stale.json?.success === false);

    console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failing check(s)\n`);
  } finally {
    await users.collection('users').deleteMany({ email: EMAIL });
    await auth.collection('captchas').deleteMany({ id: /^e2e-/ });
    await client.close();
  }
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('e2e-login error:', e.message); process.exit(1); });
