const HotPocket = require('hotpocket-js-client');

function assertEqual(name, a, b) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`Assertion failed (${name}): ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
  }
}

function assertSuccessResponse(resp) {
  if (!resp || resp.error) throw new Error(`Expected success, got error: ${JSON.stringify(resp)}`);
}

function assertErrorResponse(resp) {
  if (!resp || !resp.error) throw new Error(`Expected error, got success: ${JSON.stringify(resp)}`);
}

async function connectClient(url) {
  const userKeyPair = await HotPocket.generateKeys();
  const client = await HotPocket.createClient([url], userKeyPair);
  if (!await client.connect()) throw new Error('Connection failed');
  return { client, userKeyPair };
}

async function submitInput(client, payload) {
  const r = await client.submitContractInput(Buffer.from(JSON.stringify(payload)));
  await r.submissionStatus; // wait accepted
}

async function submitRead(client, payload) {
  const result = await client.submitContractReadRequest(Buffer.from(JSON.stringify(payload)));
  try { return JSON.parse(result); } catch (_) { return result; }
}

module.exports = {
  assertEqual,
  assertSuccessResponse,
  assertErrorResponse,
  connectClient,
  submitInput,
  submitRead
};
