const { ContractResponseTypes } = require('../Constants/constants');

function success(data) {
  return { success: data, error: null, code: ContractResponseTypes.OK };
}

function error(code, message, details) {
  return { success: null, error: { code, message, details }, code };
}

module.exports = {
  success,
  error
};
