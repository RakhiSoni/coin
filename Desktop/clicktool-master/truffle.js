// Allows us to use ES6 in our migrations and tests.
require('babel-register')
var constants = require('./modules/constants');
const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
const privKey = constants.PRIV_KEY; // raw private key
const infuraKey = constants.INFURA_KEY;
//0xb61e0fedec42ad205f1af4ad5fc9e75e408f4e10: Contract Address
module.exports = {

  solc: {
        optimizer: {
          enabled: true,
          runs: 200
        }
  },
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      //gas: 8000000,   // <--- Twice as much
      
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(privKey, constants.INFURA_ENDPOINT+infuraKey);
      },
      network_id: 3,
      gas: 4700000,   // <--- Twice as much
      gasPrice: 10000000000
      //gasPrice: web3.toWei('10','gwei')

    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(privKey, constants.INFURA_ENDPOINT+infuraKey);
      },
      network_id: 1,
      gas: 4700000,   // <--- Twice as much
      gasPrice: 10000000000
      //gasPrice: web3.toWei('10','gwei')

    },

  }
}
