const { UpgradeService } = require('../Services/Common.Services/Upgrade.Service');
const { env } = require('../Constants/Config');
const { ContractResponseTypes } = require('../Constants/constants');
const { verifyEd25519SignaturePlaceholder } = require('../Utils/Crypto.Helper');

function toLowerHex(v) { return (v || '').toLowerCase(); }

class UpgradeController {
  constructor(message, ctx) {
    this.message = message;
    this.ctx = ctx;
    this.service = new UpgradeService(message, ctx);
  }

  async handle(userPubKeyHex) {
    try {
      if (this.message.Action !== 'UpgradeContract') {
        return { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'Invalid action.' } };
      }

      const maint = toLowerHex(env.MAINTAINER_PUBKEY || '');
      if (!maint) return { error: { code: ContractResponseTypes.UNAUTHORIZED, message: 'Maintainer key not configured.' } };
      if (maint !== toLowerHex(userPubKeyHex)) return { error: { code: ContractResponseTypes.UNAUTHORIZED, message: 'Unauthorized.' } };

      const contentBuf = Buffer.from(this.message?.data?.content?.buffer || this.message?.data?.content || []);
      const signatureHex = this.message?.signature || '';
      const sigOk = verifyEd25519SignaturePlaceholder(contentBuf, signatureHex, maint);
      if (!sigOk) return { error: { code: ContractResponseTypes.UNAUTHORIZED, message: 'Signature verification failed.' } };

      return await this.service.upgradeContract();
    } catch (e) {
      return { error: { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Error' } };
    }
  }
}

module.exports = {
  UpgradeController
};
