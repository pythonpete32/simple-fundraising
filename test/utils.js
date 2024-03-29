const getLog = (receipt, logName, argName) => {
  const log = receipt.logs.find(({ event }) => event === logName);
  return log ? log.args[argName] : null;
};

const deployedContract = receipt => getLog(receipt, "NewAppProxy", "proxy");

const deployedToken = receipt => console.log(receipt.to);

module.exports = {
  getLog,
  deployedContract,
  deployedToken
};
