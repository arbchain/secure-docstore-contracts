var MasterContract = artifacts.require("./MasterContract.sol");

module.exports = function(deployer) {
  deployer.deploy(MasterContract);
};
