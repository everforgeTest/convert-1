const fs = require('fs');
const { SqliteDatabase } = require('./dbHandler');
const { settings } = require('../../Constants/Config');
const { Tables, ContractResponseTypes } = require('../../Constants/constants');

class UpgradeService {
  constructor(message, ctx) {
    this.message = message;
    this.ctx = ctx;
    this.db = new SqliteDatabase(settings.dbPath);
  }

  async upgradeContract() {
    const resObj = {};
    try {
      if (!this.message || !this.message.data) {
        resObj.error = { code: ContractResponseTypes.BAD_REQUEST, message: 'Missing payload.' };
        return resObj;
      }

      const zipData = this.message.data;
      const version = parseFloat(zipData.version);
      if (!version || isNaN(version)) {
        resObj.error = { code: ContractResponseTypes.BAD_REQUEST, message: 'Invalid version.' };
        return resObj;
      }

      this.db.open();
      const row = await this.db.getLastRecord(Tables.CONTRACT_VERSION);
      const currentVersion = row ? parseFloat(row.Version) : 0.0;

      if (version <= currentVersion) {
        resObj.error = { code: ContractResponseTypes.FORBIDDEN, message: 'Contract version must be greater than current.' };
        return resObj;
      }

      fs.writeFileSync(settings.newContractZipFileName, Buffer.from(zipData.content.buffer || zipData.content));

      const shellScriptContent = `#!/bin/bash\
\
! command -v unzip &>/dev/null && apt-get update && apt-get install --no-install-recommends -y unzip\
\
zip_file=\"${settings.newContractZipFileName}\"\
unzip -o -d ./ \"$zip_file\" >>/dev/null\
rm \"$zip_file\" >>/dev/null\
`;

      fs.writeFileSync(settings.postExecutionScriptName, shellScriptContent);
      fs.chmodSync(settings.postExecutionScriptName, 0o777);

      const nowIso = new Date(this.ctx.timestamp).toISOString();
      const data = {
        Version: version,
        Description: zipData.description || '',
        CreatedOn: nowIso,
        LastUpdatedOn: nowIso
      };
      const ins = await this.db.insertValue(Tables.CONTRACT_VERSION, data);

      resObj.success = { id: ins.lastId, message: 'Upgrade prepared. Post script will apply changes.' };
      return resObj;
    } catch (e) {
      resObj.error = { code: ContractResponseTypes.INTERNAL_SERVER_ERROR, message: e.message || 'Failed to upgrade.' };
      return resObj;
    } finally {
      this.db.close();
    }
  }
}

module.exports = {
  UpgradeService
};
