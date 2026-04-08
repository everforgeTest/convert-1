const { SqliteDatabase } = require('../Common.Services/dbHandler');
const { settings } = require('../../Constants/Config');
const { Tables } = require('../../Constants/constants');

class AuthService {
  constructor(message, ctx) {
    this.message = message;
    this.ctx = ctx;
    this.db = new SqliteDatabase(settings.dbPath);
  }

  async registerOrUpdateSelf(pubKeyHex) {
    const resObj = {};
    try {
      const name = this.message.data?.name || '';
      const email = this.message.data?.email || '';
      this.db.open();
      const existing = await this.db.getValues(Tables.USERS, { PubKey: pubKeyHex });
      const nowIso = new Date(this.ctx.timestamp).toISOString();
      if (existing && existing.length > 0) {
        // update
        await this.db.updateValue(Tables.USERS, { Name: name, Email: email, UpdatedOn: nowIso }, { PubKey: pubKeyHex });
        resObj.success = { pubKey: pubKeyHex, name, email, updated: true };
      } else {
        // insert
        const ins = await this.db.insertValue(Tables.USERS, {
          PubKey: pubKeyHex,
          Name: name,
          Email: email,
          CreatedOn: nowIso,
          UpdatedOn: nowIso
        });
        resObj.success = { id: ins.lastId, pubKey: pubKeyHex, name, email, created: true };
      }
      return resObj;
    } catch (e) {
      throw e;
    } finally {
      this.db.close();
    }
  }

  async getMe(pubKeyHex) {
    const resObj = {};
    try {
      this.db.open();
      const rows = await this.db.getValues(Tables.USERS, { PubKey: pubKeyHex });
      if (rows && rows.length > 0) {
        const u = rows[0];
        resObj.success = { id: u.Id, pubKey: u.PubKey, name: u.Name, email: u.Email, createdOn: u.CreatedOn, updatedOn: u.UpdatedOn };
      } else {
        resObj.success = null;
      }
      return resObj;
    } catch (e) {
      throw e;
    } finally {
      this.db.close();
    }
  }
}

module.exports = {
  AuthService
};
