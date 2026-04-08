const { UserService } = require('../Services/Domain.Services/User.Service');
const { ContractResponseTypes } = require('../Constants/constants');

class UserController {
  constructor(message, ctx) {
    this.message = message;
    this.ctx = ctx;
    this.service = new UserService(message, ctx);
  }

  async handle(userPubKeyHex) {
    try {
      switch (this.message.Action) {
        case 'CreateUser':
          return await this.service.create(userPubKeyHex);
        case 'GetUser':
          return await this.service.getByPubKey();
        case 'GetAllUsers':
          return await this.service.getAll();
        case 'UpdateUser':
          return await this.service.update(userPubKeyHex);
        case 'DeleteUser':
          return await this.service.delete(userPubKeyHex);
        default:
          return { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'Invalid action.' } };
      }
    } catch (e) {
      return { error: { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Error' } };
    }
  }
}

module.exports = {
  UserController
};
