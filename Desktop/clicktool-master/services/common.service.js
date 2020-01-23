const axios = require('axios');
const constants = require('../modules/constants');
var twilio = require('twilio');
var client = new twilio(constants.TWILLIO_SID, constants.TWILLIO_AUTH);

const Web3 = require('web3');
const provider = 'https://ropsten.infura.io/v3/5cfea0d474d94d178f030574a25eee02';
const web3 = new Web3(provider);
const Tx = require('ethereumjs-tx').Transaction;
const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');

exports.sendResponse = function(res, statusCode, status, message, data = '') {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.write(
    JSON.stringify({
      statusCode: status,
      message: message,
      data: data
    })
  );
  res.end();
};

exports.getBitCoinPrice = function(callback) {
  var price;
  //    callback(100);
  axios
    .get('https://api.coindesk.com/v1/bpi/currentprice/USD')
    .then(function(response) {
      // handle success
      price = response.data.bpi.USD.rate_float;
      callback(price);
    })
    .catch(function(error) {
      // handle error
      //                                (error);
    });
};
exports.getEtherPrice = function(callback) {
  var price;
  //    callback(100);
  axios
    .get('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=' + constants.ETHERSCAN_API_KEY)
    .then(function(response) {
      // handle success
      price = response.data.result.ethusd;
      callback(price);
    })
    .catch(function(error) {
      // handle error
      //                                (error);
    });
};

exports.getEtherBTC = function(callback) {
  var price;
  //    callback(100);
  axios
    .get('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=' + constants.ETHERSCAN_API_KEY)
    .then(function(response) {
      // handle success
      price = response.data.result.ethbtc;
      callback(price);
    })
    .catch(function(error) {
      // handle error
      //                                (error);
    });
};

exports.sendsms = function(user, otp, callback) {
  client.messages
    .create({
      from: '+14243610882',
      to: '+' + user.countryCode + user.phone,
      body: 'Your otp for Abundance pin reset is ' + otp
    })
    .then(message => callback({}, message.sid))
    .catch(function(error) {
      callback(error, error);
    });
};

exports.getETHToUSD = async () => {
  const url = 'https://api.coinbase.com/v2/exchange-rates?currency=ETH';
  return axios({
    url: url,
    method: 'get',
    timeout: 100000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(respo => {
      let data = respo.data.data.rates.USD;
      data = parseFloat(data);
      data = data.toFixed(2);

      return data;
    })
    .catch(err => console.error(err));
};

exports.getBTCToUSD = async () => {
  const url = 'https://api.coinbase.com/v2/exchange-rates?currency=BTC';
  return axios({
    url: url,
    method: 'get',
    timeout: 100000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(respo => {
      let data = respo.data.data.rates.USD;
      data = parseFloat(data);
      data = data.toFixed(2);

      return data;
    })
    .catch(err => console.error(err));
};

exports.convertExponentialToDecimal = exponentialNumber => {
  // sanity check - is it exponential number
  const str = exponentialNumber.toString();
  if (str.indexOf('e') !== -1) {
    const exponent = parseInt(str.split('-')[1], 10);
    // Unfortunately I can not return 1e-8 as 0.00000001, because even if I call parseFloat() on it,
    // it will still return the exponential representation
    // So I have to use .toFixed()
    const result = exponentialNumber.toFixed(exponent);
    return result;
  } else {
    return exponentialNumber;
  }
};

exports.getEtherscanTransactions = async url => {
  // Respo.... { data:
  //   { status: '0', message: 'NOTOK', result: 'Error! Invalid address format' },

  //  Respo.... { data:
  //   { status: '1', message: 'OK', result: [ [Object], [Object] ] },

  return axios({
    url: url,
    method: 'get',
    timeout: 100000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async respo => {
      if (respo.data.status == '1') {
        return respo.data.result;
      } else return 0;
    })
    .catch(err => {
      console.error(err);
      return 0;
    });
};

exports.sendSignedTransactionAdmin = async (rawTx, callback) => {
  try{
  const seed = await bip39.mnemonicToSeed(constants.ADMIN_MNEMONIC);
  const hdk = hdkey.fromMasterSeed(seed);
  const addr_node = hdk.derivePath("m/44'/60'/0'/0/0"); //m/44'/60'/0'/0/0 is derivation path for the first account. m/44'/60'/0'/0/1 is the derivation path for the second account and so on
  const addr = addr_node.getWallet().getAddressString(); //check that this is the same with the address that ganache list for the first account to make sure the derivation is correct
  const private_key = addr_node.getWallet().getPrivateKey();

  const txNonce = await web3.eth.getTransactionCount(addr, 'pending');
  if (txNonce) {
    let txnObject = {
      from: addr,
      to: constants.ABUNDANCE_CONTRACT_ADDRESS,
      gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'Gwei')),
      gas: web3.utils.toHex('300000'),
      nonce: web3.utils.toHex(txNonce),
      data: rawTx
    };
    let Tx = require('ethereumjs-tx');
    let tx = new Tx(txnObject);
    tx.sign(private_key);
    var serializedTx = tx.serialize();
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('transactionHash', function (hash) {
          console.log("hashhhh", hash);
          callback(null, hash);
      })
      .on('receipt', function(receipt) {
        console.log("Receipt called...", receipt)
        
      })
      .on('error', function(err) {
        callback(err, err);
      });
  } else callback(err, err);
} catch(err){
  console.log("Error................", err);
  callback(err, err);
}
};
