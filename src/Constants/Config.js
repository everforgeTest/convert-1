const fs = require('fs');
const path = require('path');
const settings = require('../settings.json').settings;

function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  const res = fs.readFileSync(envPath, 'utf8');
  res.split('\
').forEach((line) => {
    if (!line || !line.includes('=')) return;
    const [key, ...rest] = line.split('=');
    const val = rest.join('=');
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      env[key] = val.slice(1, -1);
    } else {
      env[key] = val;
    }
  });
  return env;
}

const env = Object.assign({}, process.env, readEnvFile());

module.exports = {
  settings,
  env
};
