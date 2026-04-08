const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Tables } = require('../Constants/constants');
const settings = require('../settings.json').settings;

class DBInitializer {
  static async init() {
    if (!fs.existsSync(settings.dbPath)) {
      const db = new sqlite3.Database(settings.dbPath);
      await runQuery(db, 'PRAGMA foreign_keys = ON');

      await runQuery(
        db,
        `CREATE TABLE IF NOT EXISTS ${Tables.CONTRACT_VERSION} (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          Version REAL NOT NULL,
          Description TEXT,
          CreatedOn TEXT,
          LastUpdatedOn TEXT
        )`
      );

      await runQuery(
        db,
        `CREATE TABLE IF NOT EXISTS ${Tables.USERS} (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          PubKey TEXT NOT NULL UNIQUE,
          Name TEXT,
          Email TEXT,
          CreatedOn TEXT,
          UpdatedOn TEXT
        )`
      );

      db.close();
    }

    // Create dbScripts folder if not exists (for future migrations)
    if (!fs.existsSync(settings.dbScriptsFolderPath)) {
      fs.mkdirSync(settings.dbScriptsFolderPath, { recursive: true });
    }
  }
}

function runQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastId: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  DBInitializer
};
