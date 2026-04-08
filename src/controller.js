const bson = require('bson');
const { ServiceTypes, ContractResponseTypes } = require('./Constants/constants');
const { AuthController } = require('./Controllers/Auth.Controller');
const { UserController } = require('./Controllers/User.Controller');
const { UpgradeController } = require('./Controllers/Upgrade.Controller');

function getUserPubKeyHex(user) {
  try {
    if (user && user.publicKey) {
      if (Buffer.isBuffer(user.publicKey)) return Buffer.from(user.publicKey).toString('hex').toLowerCase();
      if (typeof user.publicKey === 'string') return user.publicKey.toLowerCase();
    }
    if (user && user.pubKey) {
      if (Buffer.isBuffer(user.pubKey)) return Buffer.from(user.pubKey).toString('hex').toLowerCase();
      if (typeof user.pubKey === 'string') return user.pubKey.toLowerCase();
    }
  } catch (_) { }
  return '';
}

class Controller {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async handle(user, message, isReadOnly) {
    let result = { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'Invalid service.' } };
    try {
      const callerPk = getUserPubKeyHex(user);
      if (!message || typeof message !== 'object') {
        result = { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'Invalid payload.' } };
      } else if (message.Service === ServiceTypes.AUTH) {
        const controller = new AuthController(message, this.ctx);
        result = await controller.handle(callerPk);
      } else if (message.Service === ServiceTypes.USER) {
        const controller = new UserController(message, this.ctx);
        result = await controller.handle(callerPk);
      } else if (message.Service === ServiceTypes.UPGRADE) {
        const controller = new UpgradeController(message, this.ctx);
        result = await controller.handle(callerPk);
      }
    } catch (e) {
      result = { error: { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Unhandled error.' } };
    }

    // Send response back to caller; if client used BSON, return BSON
    try {
      const wantsBson = message && message._bson === true; // ad-hoc flag if client indicates
      const response = message && message.promiseId ? Object.assign({ promiseId: message.promiseId }, result) : result;
      if (wantsBson) await user.send(bson.serialize(response)); else await user.send(response);
    } catch (e) {
      // silently ignore send errors
    }
  }
}

module.exports = {
  Controller
};
