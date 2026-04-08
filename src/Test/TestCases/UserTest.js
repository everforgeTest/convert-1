const { submitInput, submitRead, assertSuccessResponse } = require('../test-utils');

async function run(client) {
  // Ensure clean read
  let resp = await submitRead(client, { Service: 'User', Action: 'GetAllUsers' });
  // Create or register self via Auth.Register
  await submitInput(client, { Service: 'Auth', Action: 'Register', data: { name: 'Alice', email: 'alice@example.com' } });
  // GetMe
  resp = await submitRead(client, { Service: 'Auth', Action: 'GetMe' });
  assertSuccessResponse(resp);
  const me = resp.success;
  if (!me || !me.pubKey) throw new Error('GetMe failed');
  const myPubKey = me.pubKey;

  // Get user by pubkey
  resp = await submitRead(client, { Service: 'User', Action: 'GetUser', data: { pubKey: myPubKey } });
  assertSuccessResponse(resp);

  // Update self
  await submitInput(client, { Service: 'User', Action: 'UpdateUser', data: { pubKey: myPubKey, name: 'Alice Updated', email: 'alice2@example.com' } });
  resp = await submitRead(client, { Service: 'User', Action: 'GetUser', data: { pubKey: myPubKey } });
  assertSuccessResponse(resp);
}

module.exports = { run };
