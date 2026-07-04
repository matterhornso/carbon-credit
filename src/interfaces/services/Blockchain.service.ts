const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const fetch = require('node-fetch');
const util = require('util');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.NODE_TLS_ACCEPT_UNTRUSTED_CERTIFICATES_THIS_IS_INSECURE = '1'
let BC_SERVICE_URL = process.env.BC_SERVICE_URL || 'http://localhost:3003';


const signatureProvider = new JsSignatureProvider([process.env.ACTOR_KEY]);
const rpc = new JsonRpc(process.env.SHINE_BLOCKCHAIN, {
  fetch
});

let ASSET_CONTRACT_NAME = process.env.ASSET_CONTRACT_NAME
let ACTOR = process.env.ACTOR

const api = new Api({
  rpc,
  signatureProvider,
  textDecoder: new util.TextDecoder(),
  textEncoder: new util.TextEncoder()
});


export class BCService {
  constructor() { }

}
