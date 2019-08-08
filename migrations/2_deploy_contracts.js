var App = artifacts.require('./App.sol')

module.exports = function (deployer) {
  deployer.deploy(App) //, 1, "0x5cb479DB92Ce3572383837c9775639dC373e4194"
}