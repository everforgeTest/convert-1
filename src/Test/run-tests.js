const { connectClient } = require('./test-utils');
const userTests = require('./TestCases/UserTest');

(async () => {
  const url = 'wss://localhost:8081';
  const { client } = await connectClient(url);
  try {
    await userTests.run(client);
    console.log('All tests passed.');
  } catch (e) {
    console.error('Test failed:', e);
  } finally {
    client.close();
  }
})();
