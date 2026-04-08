/*
Usage:
 node index.js wss://localhost:8081 ./dist.zip <signatureHex> 1.2 "Description text"
Note: signatureHex should be an Ed25519 signature of the zip buffer by the maintainer private key.
*/

const fs = require('fs');
const path = require('path');
const ContractService = require('./contract-service');

(async () => {
  const contractUrl = process.argv[2];
  const zipPath = process.argv[3];
  const signatureHex = process.argv[4] || '';
  const version = process.argv[5];
  const description = process.argv[6] || '';

  if (!contractUrl || !zipPath || !version) {
    console.log('Usage: node index.js <contractUrl> <zipFilePath> <signatureHex> <version> <description>');
    process.exit(1);
  }

  const svc = new ContractService([contractUrl]);
  await svc.init();

  const content = fs.readFileSync(path.resolve(zipPath));
  const payload = {
    Service: 'Upgrade',
    Action: 'UpgradeContract',
    data: {
      version: parseFloat(version),
      description,
      content
    },
    signature: signatureHex
  };

  try {
    const res = await svc.submitInput(payload);
    console.log('Upgrade response:', res);
  } catch (e) {
    console.error('Upgrade failed:', e);
  } finally {
    process.exit();
  }
})();
