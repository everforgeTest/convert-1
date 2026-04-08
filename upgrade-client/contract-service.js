const HotPocket = require('hotpocket-js-client');
const bson = require('bson');

class ContractService {
  constructor(servers) {
    this.servers = servers;
    this.userKeyPair = null;
    this.client = null;
    this.promiseMap = new Map();
  }

  async init() {
    if (!this.userKeyPair) this.userKeyPair = await HotPocket.generateKeys();
    if (!this.client) this.client = await HotPocket.createClient(this.servers, this.userKeyPair, { protocol: HotPocket.protocols.bson });
    if (!await this.client.connect()) throw new Error('Connection failed');
    this.client.on(HotPocket.events.contractOutput, (result) => {
      result.outputs.forEach((o) => {
        try {
          const output = bson.deserialize(o);
          if (output && output.promiseId && this.promiseMap.has(output.promiseId)) {
            const ph = this.promiseMap.get(output.promiseId);
            if (output.error) ph.reject(output.error); else ph.resolve(output);
            this.promiseMap.delete(output.promiseId);
          }
        } catch (_) {}
      });
    });
  }

  submitInput(payload) {
    const promiseId = Math.random().toString(16).slice(2);
    return new Promise((resolve, reject) => {
      this.promiseMap.set(promiseId, { resolve, reject });
      const buf = bson.serialize(Object.assign({ promiseId }, payload));
      this.client.submitContractInput(buf).then(() => {}).catch(reject);
    });
  }
}

module.exports = ContractService;
