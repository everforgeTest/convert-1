const HotPocket = require('hotpocket-nodejs-contract');
const { Controller } = require('./controller');
const { DBInitializer } = require('./Data.Deploy/initDB');
const bson = require('bson');

const contract = async (ctx) => {
  const isReadOnly = ctx.readonly;

  try {
    if (!isReadOnly) {
      await DBInitializer.init();
    }
  } catch (e) {
    // log init errors
  }

  const controller = new Controller(ctx);

  for (const user of ctx.users.list()) {
    for (const input of user.inputs) {
      const buf = await ctx.users.read(input);
      let message = null;
      try {
        message = JSON.parse(buf);
      } catch (_) {
        try {
          message = bson.deserialize(buf);
          if (message) message._bson = true;
        } catch (e) {
          message = null;
        }
      }
      if (!message) {
        await user.send({ error: { code: 400, message: 'Invalid input format' } });
        continue;
      }
      await controller.handle(user, message, isReadOnly);
    }
  }
};

const hpc = new HotPocket.Contract();
hpc.init(contract);
