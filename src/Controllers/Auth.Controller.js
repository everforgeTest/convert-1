const { AuthService } = require('../Services/Domain.Services/Auth.Service');
const { ContractResponseTypes } = require('../Constants/constants');

class AuthController {
  constructor(message, ctx) {
    this.message = message;
    this.ctx = ctx;
    this.service = new AuthService(message, ctx);
  }

  async handle(userPubKeyHex) {
    try {
      switch (this.message.Action) {
        case 'Register':
          return await this.service.registerOrUpdateSelf(userPubKeyHex);
        case 'GetMe':
          return await this.service.getMe(userPubKeyHex);
        default:
          return { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'Invalid action.' } };
      }
    } catch (e) {
      return { error: { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Error' } };
    }
  }
}

module.exports = {
  AuthController
};
