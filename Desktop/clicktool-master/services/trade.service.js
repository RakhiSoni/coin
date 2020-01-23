// Get user model.
var user = require('../models/Member');
const Wallet = require('../models/wallet');
var transaction = require('../models/Transaction');
var wallet = require('../models/wallet');
var constants = require('../modules/constants');
var moment = require('moment');
const axios = require('axios');
const _ = require('lodash');
var fs = require('fs');
var pdf = require('dynamic-html-pdf');
var arraySort = require('array-sort');
const commonService = require('../services/common.service');
const Web3 = require("web3");
const provider = 'https://ropsten.infura.io/v3/5cfea0d474d94d178f030574a25eee02';
const web3 = new Web3(provider);
const {abi} = require("../contractConfig/abi");

exports.getStatements = async function(req, data, callback) {
  // req.authenticationId = {
  //   userId : '5df32aaf565848508de6b5f9'
  // }
  var statement_type = data.statement_type;
  const wallet1 = await wallet.findOne({ memberId: req.authenticationId.userId, defaultAddress: true });
    if (wallet1) {
      const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS);
      let tokenBalance = await contract.methods.balanceOf(wallet1.walletAddress).call();
      let etherBalance = await web3.eth.getBalance(wallet1.walletAddress);

      let statements = {};
      statements.walletName = wallet1.name;
      statements.balance = (tokenBalance / constants.TAC_DECIMALS).toFixed(8);
      statements.address = wallet1.walletAddress;
      statements.coins = wallet1.coins;
      statements.defaultAddress = wallet1.walletAddress,
      statements.etherBalance = etherBalance
      //            statements.ethers = wallet.ethers;
      if (statement_type.toLowerCase() == 'e') {
        getEtherStatement(data, wallet1.walletAddress, function(error, statement) {

            statements.transactions = [];
            if (statement.length > 0) {
              statements.transactions = arraySort(statement, 'timeStamp', { reverse: true });
              callback(null, statements);
            } else callback(null, statements);
            
          });
          // const url = `${constants.ETHERSCAN_URL}?module=account&action=txlist&address=${wallet1.walletAddress}&page=1&offset=100&sort=desc&apikey=${constants.ETHERSCAN_API_KEY}`;
          // const tx = await commonService.getEtherscanTransactions(url);
          // if (tx != 0 && tx.length > 0) {
          //   const arrayPromise = tx.map(async item => {
          //       let type;
          //       if (item.to == wallet1.walletAddress.toLowerCase()) type = 'Receive';
          //       else type = 'Send';
          //       item.txURL=  `https://ropsten.etherscan.io/tx/${item.hash}`;
          //         item.value = (item.value / 10 ** 18).toFixed(8);
          //         item.type = type;
          //         item.currency ='ETH';
          //         item.input = '';
          //   });
          //   const result = await Promise.all(arrayPromise);
          //   if (result) callback(null, tx);
          //    else callback(tx, null);
          // } else callback(tx, null);
        // getEtherStatement(data, wallet1.walletAddress, function(error, statement) {
        //   statements.transactions = [];
        //   if (statement.length > 0) {
        //     parseStatementData(statement, wallet1.walletAddress, function(error, statements) {
        //       //  ("333", statements);
        //       if (statements.length > 0) {
        //         statements.transactions = arraySort(statem, 'date', { reverse: true });
        //         callback(null, statements);
        //       } else callback(null, statements);
        //     });
        //   } else if (error) callback(error, null);
        //   else {
        //     statements.transactions = [];
        //     callback(null, statements);
        //   }
        // });
      } else if (statement_type.toLowerCase() == 't') {
        console.log("i am here eeeeee",  statement_type);
        getTACStatements(req.authenticationId.userId, function(error, statement) {
          statements.transactions = [];
          if (statement.length > 0) {
            statements.transactions = arraySort(statement, 'timeStamp', { reverse: true });
            callback(null, statements);
          } else callback(null, statements);
          
        });
      } else if (statement_type.toLowerCase() == 'b') {
        getBTCStatements(data, req.authenticationId.userId, function(error, statementBTC) {
          statements.transactions = [];
          if (statementBTC.length > 0) {
            statements.transactions = arraySort(statementBTC, 'date', { reverse: true });
            callback(null, statements);
          } else callback(null, statements);
          
        });
      }
    } else callback(error1, {});
};
//exports.getStatements = getStatements;

async function getEtherStatement(data, address, callback) {
  console.log("Satemtntntnntntn.....", data);
  const url = `${constants.ETHERSCAN_URL}?module=account&action=txlist&address=${address}&page=1&offset=100&sort=desc&apikey=${constants.ETHERSCAN_API_KEY}`;
          const tx = await commonService.getEtherscanTransactions(url);
          if (tx != 0 && tx.length > 0) {
            const arrayPromise = tx.map(async item => {
                let type;
                if (item.to == address.toLowerCase()) type = 'Receive';
                else type = 'Send';
                item.txURL=  `https://ropsten.etherscan.io/tx/${item.hash}`;
                  item.value = (item.value / 10 ** 18).toFixed(8);
                  item.type = type;
                  item.currency ='ETH';
                  item.input = '';
            });
            const result = await Promise.all(arrayPromise);
            if (result) callback(null, tx);
             else callback("Error Occurred", null);
          } else callback("Error Occurred", null);
  // axios
  //   .get(
  //     constants.ETHERSCAN_URL +
  //       '/api?module=account&action=txlist&address=' +
  //       address +
  //       '&startblock=0&endblock=99999999&apikey=' +
  //       constants.ETHERSCAN_API_KEY
  //   )
  //   .then(function(response) {
  //     console.log("reponse...", response);
  //     callback(null, response);
  //   })
  //   .catch(function(error) {
  //     // handle error
  //     error;
  //     callback(error, error);
  //     //                                (error);
  //   });
}

function parseStatementData(data, address, callback) {
  var details = [];
  _.forEach(data, function(val, key) {
    var data = {};
    if (val.value > 0) {
      if (val.to.toLowerCase() == address.toLowerCase()) {
        data.type = 'receive';
      } else {
        ('send');
        data.type = 'send';
      }
      data.value = val.value / constants.DECIMALS;
      data.currency = 'ETH';
      data.to = val.to;
      data.from = val.from;
      data.transactionStatus = val.txreceipt_status == 1 ? 'completed' : 'pending';
      data.txHash = val.hash;
      data.date = val.timeStamp;
      data.txURL = constants.ETHERSCAN_URL_DETAILS + '/' + val.hash;
      details.push(data);
    }
  });
  callback(null, details);
}

async function getTACStatements(userId, callback) {
  console.log("i am here yeahhhhh",  userId);
  const user1 = await user.findOne({ _id: userId });
  if (user1) {
    const url = `${constants.ETHERSCAN_URL}?module=account&action=tokentx&contractaddress=${constants.ABUNDANCE_CONTRACT_ADDRESS}&page=1&offset=100&sort=asc&apikey=${constants.ETHERSCAN_API_KEY}`;
    const tx = await commonService.getEtherscanTransactions(url);
    if (tx != 0 && tx.length > 0) {
      let data = [];
      const wallet = await Wallet.findOne({ memberId: userId, defaultAddress: true });

      const arrayPromise = tx.map(async item => {
        if (item.to == wallet.walletAddress.toLowerCase() || item.from == wallet.walletAddress.toLowerCase()) {
          let type;
          if (item.to == wallet.walletAddress.toLowerCase()) type = 'Receive';
          else type = 'Send';
          data.push({
            to: item.to,
            from: item.from,
            timeStamp: item.timeStamp,
            txURL: `https://ropsten.etherscan.io/tx/${item.hash}`,
            value: (item.value / 10 ** 18).toFixed(8),
            hash: item.hash,
            type: type,
            currency: 'ETH'
          });
        }
      });
      const result = await Promise.all(arrayPromise);
      if (result) {
        console.log("i am here woahhhhh",  data);
        callback(null, data);
      } else callback(tx, null);
    } else callback(tx, null);
  } else callback(tx, null);
}

function getBTCStatements(data, memberId, callback) {
  transaction.find({ currencyType: data.statement_type, memberId: memberId }, null, { sort: '-date' }, function(error, transactions) {
    transactions;
    //        return false;
    if (transactions && transactions.length > 0) {
      var details = [];
      _.forEach(transactions, function(val, key) {
        var data = {};
        // if (val.transactionType == "buy") {
        //     data.type = 'buy';
        // }
        data.type = 'send';
        data.value = val.bitcoin / constants.BTC_CONST;
        data.currency = 'BTC';
        data.to = val.to;
        data.from = val.from;
        data.txHash = val.transactionHash;
        data.date = val.date;
        data.txURL = constants.ETHERSCAN_URL_DETAILS + '/' + val.transactionHash;
        details.push(data);
        'ddd', data.value;
      });
      callback(null, details);
    } else {
      callback(null, []);
    }
  });
}
/*
 {
 "txHash": "0x4a6c1f8c7b4fa8beb52a9bcba4f123d0bb226917006289d4069dabd09be37c4f",
 "to": "0xb53dfb2453d14ec0aa794c0fdeb907662a7f3d09",
 "from": "0x79bA21db618695663a6fe35A38abFBDB0F63aBF7",
 "value": 100,
 "currency": "CKC",
 "type": "send",
 "date": 12-05-2016 16:05:08 pm,
 "txURL": "https://ropsten.etherscan.io/tx/0x4a6c1f8c7b4fa8beb52a9bcba4f123d0bb226917006289d4069dabd09be37c4f"
 }
 */

exports.downloadStatements = function(req, data, callback) {
  //("app",appRoot);
  console.log("I am here tooo");
  data.page = 0;
  exports.getStatements(req, data, function(error, statement) {
    console.log("I am here hurray....", error, statement);
    if (!error) {
      //("Statements",statement.transactions)

      var html = fs.readFileSync('views/etherStatement.handlebars', 'utf8');
      // ("html",html);
      console.log("I am here yeeahhhhhhhhhhhhhhhhhhh....", html);
      var options = {
        format: 'A3',
        orientation: 'landscape',
        border: '10mm'
      };
      console.log("I am here yeeahhhhhhhhhhhhhhhhhhh.1111111111111...", options);
      var document = {
        type: 'file', // 'file' or 'buffer'
        template: html,
        context: {
          transactions: statement.transactions
        },
        path: './public/pdf/Statement-' + moment() + '.pdf'
      };
      console.log("I am here yeeahhhhhhhhhhhhhhhhhhh.2222222222222...", document);
      if (statement.transactions.length > 0) {
        console.log("I am here yeeahhhhhhhhhhhhhhhhhhh.33333333...", statement.transactions.length);
        var pdf_url = constants.ACCESSURL + document.path.split('./public/')[1];
        pdf
          .create(document, options)
          .then(res => {
            console.log("I am here yeeahhhhhhhhhhhhhhhhhhh.44444444444...", res);
            callback(null, pdf_url);
          })
          .catch(error => {
            console.log("I am here yeeahhhhhhhhhhhhhhhhhhh.555555555555555555...", error);
            callback(error, error);
          });
      } else {
        callback('no_data_found', {});
      }
    } else {
      console.log("I am here yeeahhhhhhhhhhhhhhhhhhh.5555555555555555...");
      'error', error;
    }
  });
};
