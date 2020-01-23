//var ConvertLib = artifacts.require("./ConvertLib.sol");
var ClickCoin = artifacts.require("./ClickCoinCrowdsale.sol");

module.exports = function(deployer) {
  //deployer.deploy(ConvertLib);
  //deployer.link(ConvertLib, ClickCoin);
  deployer.deploy(ClickCoin);
};
