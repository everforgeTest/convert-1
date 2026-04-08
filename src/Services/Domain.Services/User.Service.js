const { SqliteDatabase } = require('../Common.Services/dbHandler');
const { settings, env } = require('../../Constants/Config');
const { Tables, ContractResponseTypes } = require('../../Constants/constants');

function isMaintainer(callerPkHex) {
  if (!env.MAINTAINER_PUBKEY) return false;
  return (env.MAINTAINER_PUBKEY || '').toLowerCase() === (callerPkHex || '').toLowerCase();
}

class UserService {
  constructor(message, ctx) {
    this.message = message;
    this.ctx = ctx;
    this.db = new SqliteDatabase(settings.dbPath);
  }

  async create(callerPkHex) {
    const resObj = {};
    try {
      const { pubKey, name, email } = this.message.data || {};
      if (!pubKey) return { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'pubKey is required.' } };
      this.db.open();
      const nowIso = new Date(this.ctx.timestamp).toISOString();
      const exists = await this.db.getValues(Tables.USERS, { PubKey: pubKey });
      if (exists && exists.length > 0) {
        return { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'User already exists.' } };
      }
      // Only maintainer can create arbitrary users; a user can only create their own record
      if (!isMaintainer(callerPkHex) && (callerPkHex || '').toLowerCase() !== (pubKey || '').toLowerCase()) {
        return { error: { code: ContractResponseTypes.FORBIDDEN, message: 'Access denied.' } };
      }
      const ins = await this.db.insertValue(Tables.USERS, { PubKey: pubKey, Name: name || '', Email: email || '', CreatedOn: nowIso, UpdatedOn: nowIso });
      resObj.success = { id: ins.lastId, pubKey, name: name || '', email: email || '' };
      return resObj;
    } catch (e) {
      return { error: { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Error' } };
    } finally {
      this.db.close();
    }
  }

  async getByPubKey() {
    const resObj = {};
    try {
      const { pubKey } = this.message.data || {};
      if (!pubKey) return { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'pubKey is required.' } };
      this.db.open();
      const rows = await this.db.getValues(Tables.USERS, { PubKey: pubKey });
      if (rows && rows.length > 0) {
        const u = rows[0];
        resObj.success = { id: u.Id, pubKey: u.PubKey, name: u.Name, email: u.Email, createdOn: u.CreatedOn, updatedOn: u.UpdatedOn };
      } else {
        resObj.success = null;
      }
      return resObj;
    } catch (e) {
      return { error: { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Error' } };
    } finally {
      this.db.close();
    }
  }

  async getAll() {
    const resObj = {};
    try {
      this.db.open();
      const rows = await this.db.getValues(Tables.USERS, {});
      resObj.success = rows.map((u) => ({ id: u.Id, pubKey: u.PubKey, name: u.Name, email: u.Email, createdOn: u.CreatedOn, updatedOn: u.UpdatedOn }));
      return resObj;
    } catch (e) {
      return { error: { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Error' } };
    } finally {
      this.db.close();
    }
  }

  async update(callerPkHex) {
    const resObj = {};
    try {
      const { pubKey, name, email } = this.message.data || {};
      if (!pubKey) return { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'pubKey is required.' } };
      this.db.open();
      // Authorization: maintainer or owner
      if (!isMaintainer(callerPkHex) && (callerPkHex || '').toLowerCase() !== (pubKey || '').toLowerCase()) {
        return { error: { code: ContractResponseTypes.FORBIDDEN, message: 'Access denied.' } };
      }
      const nowIso = new Date(this.ctx.timestamp).toISOString();
      const result = await this.db.updateValue(Tables.USERS, { Name: name || '', Email: email || '', UpdatedOn: nowIso }, { PubKey: pubKey });
      resObj.success = { changes: result.changes };
      return resObj;
    } catch (e) {
      return { error: { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Error' } };
    } finally {
      this.db.close();
    }
  }

  async delete(callerPkHex) {
    const resObj = {};
    try {
      const { pubKey } = this.message.data || {};
      if (!pubKey) return { error: { code: ContractResponseTypes.BAD_REQUEST, message: 'pubKey is required.' } };
      this.db.open();
      if (!isMaintainer(callerPkHex) && (callerPkHex || '').toLowerCase() !== (pubKey || '').toLowerCase()) {
        return { error: { code: ContractResponseTypes.FORBIDDEN, message: 'Access denied.' } };
      }
      const result = await this.db.deleteValues(Tables.USERS, { PubKey: pubKey });
      resObj.success = { changes: result.changes };
      return resObj;
    } catch (e) {
      return { error: { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Error' } };
    } finally {
      this.db.close();
    }
  }
}

module.exports = {
  UserService
};
