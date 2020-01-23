const contract = require('truffle-contract');

const clickcoin_artifact = require('../build/contracts/ClickCoinCrowdsale.json');
var ClickCoin = contract(clickcoin_artifact);
const config = require('../modules/constants');
// var Web3 = require('web3');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/wallet');
const Referral = require('../models/Referral');
const Member = require('../models/Member');
const moment = require('moment');
var waterfall = require('async-waterfall');
var notification = require('../services/notification.service');
var async = require('async');
var common = require('../services/common.service');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const ethereumTx = require('ethereumjs-tx');
const ethereumWallet = require('ethereumjs-wallet');
//const bip39 = require('bip39');
//var mnemonic = bip39.generateMnemonic(); //generates string
//var mnemonic = bip39.entropyToMnemonic('0000000000000666')

const Web3 = require("web3");
const provider = 'https://ropsten.infura.io/v3/5cfea0d474d94d178f030574a25eee02';
const web3 = new Web3(provider);

module.exports = {

    createHDWallet:  async function (req,callback) {
    
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
    
        var mnemonic = bip39.generateMnemonic(); //generates string
        var seed = bip39.mnemonicToSeed(mnemonic); //creates seed buffer
        var root = hdkey.fromMasterSeed(seed);
        var masterPrivateKey = root.privateKey.toString('hex');
        var addrNode = root.derive("m/44'/60'/0'/0/0"); //line 1
        var privKey = addrNode._privateKey.toString('hex');
        var pubKey = ethUtil.privateToPublic(addrNode._privateKey);
        var addr = ethUtil.publicToAddress(pubKey).toString('hex');
        var address = ethUtil.toChecksumAddress(addr);

        const saved = await Member.update({'_id': req.authenticationId.userId}, {$set: {'mnemonicGenerated': true, 'mnemonicAddress':address}});
            if (saved) {
               var newWallet = new Wallet({
                name: "Wallet 1",
                memberId: req.authenticationId.userId,
                indexOfWallet: 0,
                walletAddress: address.toLowerCase(),
                defaultAddress: true
            });
                const result = await newWallet.save();
                if (result) callback(null,mnemonic,address,"Wallet 1");
                else callback("Error", {}, {});
                
            } else callback(err,{});
        },

       retrieveWallet: function(req,callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var mnemonic = req.body.mnemonic;
        var seed = bip39.mnemonicToSeed(mnemonic); //creates seed buffer
        var root = hdkey.fromMasterSeed(seed);
        var masterPrivateKey = root.privateKey.toString('hex');
        var addrNode = root.derive("m/44'/60'/0'/0/0"); //line 1
        
        var pubKey = ethUtil.privateToPublic(addrNode._privateKey);
        var addr = ethUtil.publicToAddress(pubKey).toString('hex');
        var address = ethUtil.toChecksumAddress(addr);
        //("addrNode",addrNode);
        //("pubKey",pubKey);
        //("addr",addr);

        ("address",address);
        Member.findOne({'_id': req.authenticationId.userId}, function (err, member) {
            ("memberrr",member)
            if (member && member.mnemonicAddress == address) {
               callback(null,"The mnemonic generated is correct");
            } else if (member && member.mnemonicAddress != address){
                callback("wrong_mnemonic", "seems like you have entered wrong mnemonic");
            }
            else {
                callback(err, {});
            }
        }
        );

       },

    addNewWallet: function(req,mnemonic,name,callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        
        Wallet.findOne({memberId: req.authenticationId.userId},{},{sort:{'createdAt':-1}}, function (err, wallet) {
            ("w",wallet);
            if (wallet) {
                
                var seed = bip39.mnemonicToSeed(mnemonic); //creates seed buffer
                ("mnemonic",mnemonic);
                
                var root = hdkey.fromMasterSeed(seed);
                var masterPrivateKey = root.privateKey.toString('hex');
                var index = wallet.indexOfWallet + 1;
                ("indd",index);
                var addrNode = root.derive("m/44'/60'/0'/0/"+index); //line 1
                var pubKey = ethUtil.privateToPublic(addrNode._privateKey);
                var addr = ethUtil.publicToAddress(pubKey).toString('hex');
                var address = ethUtil.toChecksumAddress(addr);
                ("add",address);
                var newWallet = new Wallet({
                    name: name ? name : `Wallet ${index}`,
                    memberId: req.authenticationId.userId,
                    walletAddress: address.toLowerCase(),
                    indexOfWallet: index,
                    defaultAddress: false
                });

            }
         
            newWallet.save(function (err, savedWallet) {
                if (err)
                {
                    ("err", err);
                    callback(err, {}, {});
                }
                Member.update({'_id': req.authenticationId.userId}, {$push: {"wallets": savedWallet._id}}, function (err, result) { 
                     
                    (result); 
                    ("savedWallet", savedWallet);
                    callback(null, savedWallet);
                })
                
            });
        });
        
    },

    transferEther: function(address,amount,callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var txnNonce;
        var txnObject;
        var amountStr = amount.toString();
    
        web3.eth.getTransactionCount(config.OWNER_ADDRESS, 'pending')
                .then(function (data) {
                    txnNonce = data;
                    (txnNonce);
                    txnObject = {
                        from: config.OWNER_ADDRESS,
                        to: address,
                        value: web3.utils.toHex(amountStr),
                        gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'Gwei')),
                        gas: web3.utils.toHex('3000000'),
                        nonce: web3.utils.toHex(txnNonce),

                    };

                    ({
                        from: config.OWNER_ADDRESS,
                        to: address,
                        value: web3.utils.toHex(web3.utils.toWei(amountStr, 'ether')),
                        gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'Gwei')),
                        gas: web3.utils.toHex('3000000'),
                        nonce: web3.utils.toHex(txnNonce),

                    });


                    var Tx = require('ethereumjs-tx');
                    var privateKey = new Buffer(config.PRIV_KEY, 'hex');

                    var tx = new Tx(txnObject);
                    tx.sign(privateKey);

                    var serializedTx = tx.serialize();
                    (serializedTx);

                    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                            .on('transactionHash', function (hash) {
                                ("hash");
                                
                            })
                            .on('receipt', function (receipt) {
                                ("Receipt Called");
                                (receipt);
                                callback(null, receipt);
                            }).on('error', function (err) {
                        
                        
                        var minedPending = "Be aware that it might still be mined";
                        var sourceErr = " " + err + " ";
                        if (sourceErr.indexOf(minedPending) !== -1)
                        {
                            var rtnObj = {
                                "status": "pending",
                                "data": err,
                                "errmsg": "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                            };
                            
                            //callback(err, rtnObj.valueOf());
                        } else
                        {   
                            ("erorrrrrrrrr is ",err);
                            //callback(err, err);
                        }
                    });
                });
    },

        buyTACToken: async function (req, contractAddress, sender, privateKey, amount, coins, callback) {
    try{
        const amountwei = amount.toFixed(10);
        web3.eth.getTransactionCount(sender, 'pending')
        .then(txNonce => {
            const txnObject = {
                from: sender,
                to: contractAddress,
                value: web3.utils.toHex(web3.utils.toWei(amountwei.toString(), 'ether')),
                gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'Gwei')),
                gas: web3.utils.toHex('300000'),
                nonce: web3.utils.toHex(txNonce)
            };
            console.log("1010101010101010101010101010...................", txNonce, txnObject);
            console.log("********************************************");

            let Tx = require('ethereumjs-tx');
            let tx = new Tx(txnObject);
            tx.sign(privateKey);
            var serializedTx = tx.serialize();
            console.log("11.11.11.11.11.11.11.11.11...................", serializedTx);
            console.log("********************************************");

            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                .on('transactionHash', function (hash) {
                    console.log("12.12.12.12.12.12....................", hash);
            console.log("********************************************");
                    callback(null, hash);
                })
                .on('receipt', function (receipt) {
                    console.log("Receipt Called.......................", receipt);
            console.log("********************************************");
                    
                }).on('error', function (err) {
                    callback(err, err);
                });
            })
        }
        catch(err){
            console.log("errrrrr.....", err);
            callback(err, err);
        }
    },


    buyToken: function (req,clicktoolAddress, sender, privateKey, amount, coins, callback) {

        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var txnNonce;
        var txnObject;
        var amountStr = amount.toString();
    
        web3.eth.getTransactionCount(sender, 'pending')
                .then(function (data) {
                    txnNonce = data;
                    (txnNonce);
                    txnObject = {
                        from: sender,
                        to: clicktoolAddress,
                        value: web3.utils.toHex(web3.utils.toWei(amountStr, 'ether')),
                        gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'Gwei')),
                        gas: web3.utils.toHex('3000000'),
                        nonce: web3.utils.toHex(txnNonce),

                    };

                    ({
                        from: sender,
                        to: clicktoolAddress,
                        value: web3.utils.toHex(web3.utils.toWei(amountStr, 'ether')),
                        gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'Gwei')),
                        gas: web3.utils.toHex('3000000'),
                        nonce: web3.utils.toHex(txnNonce),

                    });


                    var Tx = require('ethereumjs-tx');
                   // var privateKey = new Buffer(privatekey, 'hex');

                    var tx = new Tx(txnObject);
                    tx.sign(privateKey);

                    var serializedTx = tx.serialize();
                    (serializedTx);

                    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                            .on('transactionHash', function (hash) {
                                ("hash");
                                callback(null, hash);
                            })
                            .on('receipt', function (receipt) {
                                ("Receipt Called");
                                (receipt);

                                waterfall([

                                    function (callback1) {

                                        Transaction.findOne({transactionHash: receipt.transactionHash}, function (err, foundTx) {
                                            if (err) {
                                                ("err data base find", err);
                                            }
                                            else {
                                                foundTx.transactionStatus = "completed",
                                                        foundTx.date = moment().unix();
                                                        ("newwwfffff",foundTx.date);
                                                foundTx.save(function (err1) {
                                                    if (err1) {
                                                        ("err while saving in db", err1);
                                                        callback1('error', err1);
                                                    } else {
                                                        Wallet.findOne({walletAddress: sender}, function (error, wallet) {
                                                            if (wallet) {
                                                                var totalBalance = ((wallet.balance + (coins * config.CKC_CONST)));
                                                                var notidata = {
                                                                    type: "transaction_notification",
                                                                    title: "Clicktool – Successful Transaction",
                                                                    message: "Your purchase of " + coins + " Clickcoin has been successful. Your updated balance is " + totalBalance / config.CKC_CONST,
                                                                    createdAt: moment(),
                                                                    totalBalance: (totalBalance / config.CKC_CONST),
                                                                    coins: coins,
                                                                    email_temp: 'transaction_success'

                                                                };
                                                                notification.notifyUser(req.authenticationId.userId, notidata, function (d) {
                                                                    (d);
                                                                });
                                                                Wallet.update({walletAddress: sender}, {$set: {balance: totalBalance, inUse: true}}, function (err, succ) {
                                                                    if (succ) {
                                                                        (succ);
                                                                    } else {
                                                                        (err);
                                                                    }
                                                                });
                                                            } else {
                                                                (error);
                                                            }
                                                        });
                                                        ("Updated Status for Transaction");
                                                        ("Reacheddddddddddd At 1");
                                                        callback1(null, foundTx);
                                                    }
                                                })
                                            }
                                        });
                                    },
                                    function (transaction, callback2) {
                                        Member.findById(transaction.memberId, function (err2, foundMember) {
                                            if (err2) {
                                                ("err while finding member is having referral code or not", err2);
                                                callback2('error', err2);
                                            } else if (foundMember.referredBy && transaction.isFirstTx == true) {
                                                callback2(null, transaction, foundMember);
                                            } else {
                                                callback2('error', 'done');
                                            }

                                        })
                                    },
                                    function (transaction, buyingMember, callback3) {
                                        Member.findOne({referralCode: buyingMember.referredBy}, function (err3, referredByMember) {
                                            if (err3) {
                                                ("err while finding member is having referral code or not", err3);
                                                callback3('error', err3);
                                            } else {
                                                var newReferral = new Referral({
                                                    userIdThatBuys: buyingMember._id,
                                                    userIdThatRefers: referredByMember._id,
                                                    amountOfEther: transaction.ether,
                                                    //amountOfBitcoin: transaction.bitcoin,
                                                    etherRewarded: (transaction.ether * 7) / 100,
                                                    rewardStatus: "pending",
                                                    dateAssigned: moment()

                                                });

                                                newReferral.save(function (err, savedReferral) {
                                                    if (err)
                                                    {
                                                        ("err", err);
                                                    }
                                                    ("savedReferral", savedReferral);
                                                    callback3(null, "done");

                                                });

                                            }
                                        })
                                    }

                                ], function (error, result) {
                                    if (error) {
                                        ("error in water fall", error);
                                    } else {
                                        ("result", result);
                                    }

                                })

                            }).on('error', function (err) {
                        ("Error Called: " + err);
                        
                        var minedPending = "Be aware that it might still be mined";
                        var sourceErr = " " + err + " ";
                        if (sourceErr.indexOf(minedPending) !== -1)
                        {
                            var rtnObj = {
                                "status": "pending",
                                "data": err,
                                "errmsg": "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                            };
                            var notidata = {
                                type: "transaction_notification",
                                title: "Clicktool – Transaction Pending",
                                message: "Your transaction is on the Blockchain. Depending on data traffic, it may take some time to execute.",
                                createdAt: moment(),
                                coins: coins,
                                email_temp: 'transaction_pending'
                            };
                           // Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed.
           
                            notification.notifyUser(req.authenticationId.userId, notidata, function (d) {
                                (d);
                            });
                            //callback(err, rtnObj.valueOf());
                        } else
                        {   
                            ("erorrrrrrrrr is ",err);
                            //callback(err, err);
                            var notidata = {
                                type: "transaction_notification",
                                title: "Clicktool – Transaction Failed",
                                message: "We weren’t able to complete your purchase of " + coins + " Clickcoin. Please try again",
                                createdAt: moment(),
                                coins: coins,
                                email_temp: 'transaction_failed'
                            };
                            notification.notifyUser(req.authenticationId.userId, notidata, function (d) {
                                (d);
                            });

                        }
                    });
                });
    },

    getWalletDetail: function (address, callback) {

        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);

        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS);

        var wallet = contractInstance.methods.getBalanceInfo(address).call()
                .then(function (data) {
                    ("dattaaa",data);
                    ("valueee",data.valueOf());
                    callback(data.valueOf());
                   
                })
                .catch(function (e) {
                    (e);
                    callback("ERROR 404");
                });        
                
    },

    buyTokenWithBTC: function (address, tokens,callback) {

        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS, {
            from: config.OWNER_ADDRESS
        });
        var txnNonce;
        var txnObject;

        web3.eth.getTransactionCount(config.OWNER_ADDRESS,'pending')
        .then(function(data){
          txnNonce = data;
          (txnNonce);
          txnObject = {
            from : config.OWNER_ADDRESS,
            to : config.CONTRACT_ADDRESS,
            value : "0x0",
            gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
            gas: web3.utils.toHex('3000000'),
            nonce: web3.utils.toHex(txnNonce),
            data: contractInstance.methods.buywithBTC(address,tokens).encodeABI()
          };
  
          (txnObject);
  
          var Tx = require('ethereumjs-tx');
          var privateKey = new Buffer(config.PRIV_KEY, 'hex');
  
          var tx = new Tx(txnObject);
          tx.sign(privateKey);
  
          var serializedTx = tx.serialize();
          (serializedTx);
  
          web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', function(receipt){
              ("Receipt Called");
              callback(null,"Tokens Assigned in exchange of btc");
            
            }).on('error', function(err){
              ("Error Called: "+ err);
  
              var minedPending = "Be aware that it might still be mined";
              var sourceErr = " " + err + " ";
              if(sourceErr.indexOf(minedPending) !== -1)
              {
                var rtnObj = {
                  "status" : "pending",
                  "data" : err,
                  "errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                  };
  
                callback(rtnObj.valueOf());  
              }
              else
              {
                
                callback("ERROR 404");
                
              }
            });
              
            });     
                
    },

    getTokenBalances: function (callback) {

        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);

        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS);
    
            async.parallel([
                // function1
                function (function1Callback) {
                    contractInstance.methods.initialSupply().call(function(err,initialsupply) {
                        
                        function1Callback(null, initialsupply);
                    });
                },
                function (function2Callback) {
                    var wallet = contractInstance.methods.getBalanceInfo(config.OWNER_ADDRESS).call()
                        .then(function (balanceamount) {
                            ("dattaaa",balanceamount);
                            function2Callback(null, balanceamount);
                        })
                        .catch(function (e) {
                            (e);
                            callback("ERROR 404");
                        });    
                },
                function (function3Callback) {
                    contractInstance.methods.crowdSaleTotalTokensSold().call(function(err,tokensSold) {
                       
                        function3Callback(null, tokensSold);
                    });
                }

            ], function (error, arrResult) {
                (arrResult);
                var initialSupply = arrResult[0];
                var tokensRemaining = arrResult[1];
                ("arr0",arrResult[0]);
                ("arr1",arrResult[1]);

                var tokenSold = arrResult[2];
                ("tokens",tokenSold);
                callback(null, initialSupply,tokensRemaining,tokenSold);
            });
    
    },

    getCKCBalance: function (callback) {

        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);

        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS);

        var wallet = contractInstance.methods.balanceOf(config.OWNER_ADDRESS).call()
                .then(function (data) {
                    callback(null, data.valueOf());
                })
                .catch(function (err) {
                    (err);
                    callback(err, err);
                });
    },

    getCrowdsaleRoundDetails: function (index, callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);

        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS);

        var rounddetails = contractInstance.methods.getRoundDetails(index).call()
                .then(function (data) {
                    callback(null, data.valueOf());
                })
                .catch(function (err) {
                    (err);
                    callback(err, err);
                });

    },

    getCrowdsaleRoundPrices: function (callback) {
        ("I am here  alsooooo");
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);

        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS);

        var roundprices = contractInstance.methods.getRoundPrices().call()
                .then(function (data) {
                    callback(null, data.valueOf());
                })
                .catch(function (err) {
                    (err);
                    callback(err, err);
                });
    },

    getAllCrowdsaleDetails: function (callback) {
        ("Iam here too......")
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        ("22222222222222222222222.............",  web3);

        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS);
        ("33333333333333333333333333333.............",  contractInstance);
        async.parallel([
            // function1
            function (function1Callback) {
                contractInstance.methods.crowdsaleStartTime().call(function(err,starttime) {
                    ("4444444444444444444444.............",  starttime);
                    function1Callback(null, starttime);
                });
            },
            function (function2Callback) {
                contractInstance.methods.crowdsaleEndTime().call(function(err,endtime) {
                    ("55555555555555555555555555555.............",  endtime);
                    function2Callback(null, endtime);
                });
            },
            function (function3Callback) {
                contractInstance.methods.crowdSaleTotalTokensSold().call(function(err,tokensSold) {
                    ("6666666666666666666666.............",  tokensSold);
                    function3Callback(null, tokensSold);
                });
            },
            function (function4Callback) {
                contractInstance.methods.crowdSaleTotalEthRaised().call(function(err,ethRaised) {
                    ("77777777777777777777.............",  ethRaised);
                    function4Callback(null, ethRaised);
                });
            },
            function (function5Callback) {
                common.getEtherPrice(function (ethprice) {
                    function5Callback(null, ethprice);
                });
            },
            function (function6Callback) {
                contractInstance.methods.initialSupply().call(function(err,initialsupply) {
                    function6Callback(null, initialsupply);
                });
            },
            function (function7Callback) {
                contractInstance.methods.getBalanceInfo(config.OWNER_ADDRESS).call(function(err,tokenRem) {
                    function7Callback(null, tokenRem);
                });
            },
            function (function8Callback) {
                contractInstance.methods._stage().call(function(err,stage) {
                    function8Callback(null, stage);
                });
            },
             function (function9Callback) {
                contractInstance.methods.CLCPerEther().call(function(err,clcperether) {
                    function9Callback(null, clcperether);
                });
            },
             function (function10Callback) {
                contractInstance.methods.CLCPerBitcoin().call(function(err,clcperbitcoin) {
                    function10Callback(null, clcperbitcoin);
                });
            },
             function (function11Callback) {
                contractInstance.methods.CLCPerDollar().call(function(err,clcperdollar) {
                    function11Callback(null, clcperdollar);
                });
            },
            
        ], function (error, arrResult) {
            ("666666666666666666.............",  arrResult);
            (arrResult);
            var startTime = moment.unix(arrResult[0]).utc().format('YYYY-MM-DD HH:mm:ss');
            var endEime =  moment.unix(arrResult[1]).utc().format('YYYY-MM-DD HH:mm:ss');
            var tokenSold = arrResult[2] / config.CKC_CONST;
            var ethRaised = arrResult[3] / config.DECIMALS;
            var dollarsRaised = (arrResult[3] / config.DECIMALS) * arrResult[4];
            var totalTokens = arrResult[5]  / config.CKC_CONST;
            var tokensRem = arrResult[6]  / config.CKC_CONST;
            var stage = arrResult[7];
            var clcperether = arrResult[8];
            var clcperbitcoin = arrResult[9];
            var clcperdollar = arrResult[10];
            ("7777777777777777777.............",  ethRaised,dollarsRaised,totalTokens);
            callback(null, startTime,endEime,tokenSold,ethRaised,dollarsRaised,totalTokens,tokensRem,stage,clcperether,clcperbitcoin,clcperdollar);
        });

    },

    transferTokensToUsers: function (callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS, {
            from: config.OWNER_ADDRESS
        });
        var txnNonce;
        var txnObject;

        web3.eth.getTransactionCount(config.OWNER_ADDRESS,'pending')
        .then(function(data){
          txnNonce = data;
          (txnNonce);
          txnObject = {
            from : config.OWNER_ADDRESS,
            to : config.CONTRACT_ADDRESS,
            value : "0x0",
            gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
            gas: web3.utils.toHex('3000000'),
            nonce: web3.utils.toHex(txnNonce),
            data: contractInstance.methods.transferAllTokens().encodeABI()
          };
  
          (txnObject);
  
          var Tx = require('ethereumjs-tx');
          var privateKey = new Buffer(config.PRIV_KEY, 'hex');
  
          var tx = new Tx(txnObject);
          tx.sign(privateKey);
  
          var serializedTx = tx.serialize();
          (serializedTx);
  
          web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', function(receipt){
              ("Receipt Called");
              callback(null,"Crowdsale Stage Started");
            
            }).on('error', function(err){
              ("Error Called: "+ err);
  
              var minedPending = "Be aware that it might still be mined";
              var sourceErr = " " + err + " ";
              if(sourceErr.indexOf(minedPending) !== -1)
              {
                var rtnObj = {
                  "status" : "pending",
                  "data" : err,
                  "errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                  };
  
                callback(rtnObj.valueOf());  
              }
              else
              {
                
                callback("ERROR 404");
                
              }
            });
              
            });

    },

    checkAirdrop: function(callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS, {
            from: config.OWNER_ADDRESS
        });
        contractInstance.methods.AIRDROP_SUPPLY().call(function(err,airdropsupply) {
            callback(null, airdropsupply);
        });
    },

    executeAirdrop: function (addresses,tokens,callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS, {
            from: config.OWNER_ADDRESS
        });
        var txnNonce;
        var txnObject;
        ("ddd",addresses)
        ("fff",tokens);
       
        //var addresses = ["0x166B7bE44994B82B465723Ad12AE9787e6dF63ff","0xBf438455d2E6558f88F15749C6A91cd693F238Ea"];
        //var tokens = [1,2]
        //("addddd",addresses);
       // ("tokknb",tokens);
        web3.eth.getTransactionCount(config.OWNER_ADDRESS,'pending')
        .then(function(data){
          txnNonce = data;
          (txnNonce);
          txnObject = {
            from : config.OWNER_ADDRESS,
            to : config.CONTRACT_ADDRESS,
            value : "0x0",
            gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
            gas: web3.utils.toHex('3000000'),
            nonce: web3.utils.toHex(txnNonce),
            data: contractInstance.methods.multisend(addresses,tokens).encodeABI()
          };
  
          (txnObject);
  
          var Tx = require('ethereumjs-tx');
          var privateKey = new Buffer(config.PRIV_KEY, 'hex');
  
          var tx = new Tx(txnObject);
          tx.sign(privateKey);
  
          var serializedTx = tx.serialize();
          (serializedTx);
  
          web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', function(receipt){
              ("Receipt Called");
              callback(null,"Crowdsale Stage Started");
            
            }).on('error', function(err){
              ("Error Called: "+ err);
  
              var minedPending = "Be aware that it might still be mined";
              var sourceErr = " " + err + " ";
              if(sourceErr.indexOf(minedPending) !== -1)
              {
                var rtnObj = {
                  "status" : "pending",
                  "data" : err,
                  "errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                  };
  
                callback(rtnObj.valueOf());  
              }
              else
              {
                
                callback("ERROR 404");
                
              }
            });
              
            });

    },

    getGasEstimate: function (amount, sender, callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        //var BN = web3.utils.BN;
        //var amount = new BN (amount).toString();
        var amount = amount.toString();
        ("BN", amount);
        ("wei", web3.utils.toWei(amount, 'ether'));
        web3.eth.estimateGas({
            from: sender,
            to: config.CONTRACT_ADDRESS,
            value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
        }).then(function (gasAmount) {
            totalGasUsedInGwei = gasAmount * 2;
            totalGasUsedInEther = (totalGasUsedInGwei / 1000000000);
            var totalAmountInEther = parseFloat(amount) + parseFloat(totalGasUsedInEther);
            (gasAmount)
            ("gwei", totalGasUsedInGwei)
            ("ether", totalGasUsedInEther)
            callback(null, totalGasUsedInEther, totalAmountInEther);
        })

    },

    getAccountBalance: function (address, callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        web3.eth.getBalance(address, function (error, result) {
            if (!error) {
                callback(null, web3.utils.fromWei(result, 'ether'));
            } else {
                callback(error, error);
            }
        });
    },

    startCrowdsaleStage: function(index,callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS, {
            from: config.OWNER_ADDRESS
        });
        var txnNonce;
        var txnObject;

        web3.eth.getTransactionCount(config.OWNER_ADDRESS,'pending')
        .then(function(data){
          txnNonce = data;
          (txnNonce);
          txnObject = {
            from : config.OWNER_ADDRESS,
            to : config.CONTRACT_ADDRESS,
            value : "0x0",
            gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
            gas: web3.utils.toHex('3000000'),
            nonce: web3.utils.toHex(txnNonce),
            data: contractInstance.methods.startCrowdsaleStage(index).encodeABI()
          };
  
          (txnObject);
  
          var Tx = require('ethereumjs-tx');
          var privateKey = new Buffer(config.PRIV_KEY, 'hex');
  
          var tx = new Tx(txnObject);
          tx.sign(privateKey);
  
          var serializedTx = tx.serialize();
          (serializedTx);
  
          web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', function(receipt){
              ("Receipt Called");
              callback(null,"Crowdsale Stage Started");
            
            }).on('error', function(err){
              ("Error Called: "+ err);
  
              var minedPending = "Be aware that it might still be mined";
              var sourceErr = " " + err + " ";
              if(sourceErr.indexOf(minedPending) !== -1)
              {
                var rtnObj = {
                  "status" : "pending",
                  "data" : err,
                  "errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                  };
  
                callback(rtnObj.valueOf());  
              }
              else
              {
                
                callback("ERROR 404");
                
              }
            });
              
            });

    },


    endCrowdsaleStage: function(callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS, {
            from: config.OWNER_ADDRESS
        });
        var txnNonce;
        var txnObject;

        web3.eth.getTransactionCount(config.OWNER_ADDRESS,'pending')
        .then(function(data){
          txnNonce = data;
          (txnNonce);
          txnObject = {
            from : config.OWNER_ADDRESS,
            to : config.CONTRACT_ADDRESS,
            value : "0x0",
            gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
            gas: web3.utils.toHex('3000000'),
            nonce: web3.utils.toHex(txnNonce),
            data: contractInstance.methods.endCrowdsaleStage().encodeABI()
          };
  
          (txnObject);
  
          var Tx = require('ethereumjs-tx');
          var privateKey = new Buffer(config.PRIV_KEY, 'hex');
  
          var tx = new Tx(txnObject);
          tx.sign(privateKey);
  
          var serializedTx = tx.serialize();
          (serializedTx);
  
          web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', function(receipt){
              ("Receipt Called");
              callback(null,"Crowdsale Stage Started");
            
            }).on('error', function(err){
              ("Error Called: "+ err);
  
              var minedPending = "Be aware that it might still be mined";
              var sourceErr = " " + err + " ";
              if(sourceErr.indexOf(minedPending) !== -1)
              {
                var rtnObj = {
                  "status" : "pending",
                  "data" : err,
                  "errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                  };
  
                callback(rtnObj.valueOf());  
              }
              else
              {
                
                callback("ERROR 404");
                
              }
            });
              
            });

    },


    pauseICO: function(callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS, {
            from: config.OWNER_ADDRESS
        });
        var txnNonce;
        var txnObject;

        web3.eth.getTransactionCount(config.OWNER_ADDRESS,'pending')
        .then(function(data){
          txnNonce = data;
          (txnNonce);
          txnObject = {
            from : config.OWNER_ADDRESS,
            to : config.CONTRACT_ADDRESS,
            value : "0x0",
            gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
            gas: web3.utils.toHex('3000000'),
            nonce: web3.utils.toHex(txnNonce),
            data: contractInstance.methods.pause().encodeABI()
          };
  
          (txnObject);
  
          var Tx = require('ethereumjs-tx');
          var privateKey = new Buffer(config.PRIV_KEY, 'hex');
  
          var tx = new Tx(txnObject);
          tx.sign(privateKey);
  
          var serializedTx = tx.serialize();
          (serializedTx);
  
          web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', function(receipt){
              ("Receipt Called");
              callback(null,"Crowdsale Stage Started");
            
            }).on('error', function(err){
              ("Error Called: "+ err);
  
              var minedPending = "Be aware that it might still be mined";
              var sourceErr = " " + err + " ";
              if(sourceErr.indexOf(minedPending) !== -1)
              {
                var rtnObj = {
                  "status" : "pending",
                  "data" : err,
                  "errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                  };
  
                callback(rtnObj.valueOf());  
              }
              else
              {
                
                callback("ERROR 404");
                
              }
            });
              
            });

    },

     resumeICO: function(callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS, {
            from: config.OWNER_ADDRESS
        });
        var txnNonce;
        var txnObject;

        web3.eth.getTransactionCount(config.OWNER_ADDRESS,'pending')
        .then(function(data){
          txnNonce = data;
          (txnNonce);
          txnObject = {
            from : config.OWNER_ADDRESS,
            to : config.CONTRACT_ADDRESS,
            value : "0x0",
            gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
            gas: web3.utils.toHex('3000000'),
            nonce: web3.utils.toHex(txnNonce),
            data: contractInstance.methods.unpause().encodeABI()
          };
  
          (txnObject);
  
          var Tx = require('ethereumjs-tx');
          var privateKey = new Buffer(config.PRIV_KEY, 'hex');
  
          var tx = new Tx(txnObject);
          tx.sign(privateKey);
  
          var serializedTx = tx.serialize();
          (serializedTx);
  
          web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', function(receipt){
              ("Receipt Called");
              callback(null,"Crowdsale Stage Started");
            
            }).on('error', function(err){
              ("Error Called: "+ err);
  
              var minedPending = "Be aware that it might still be mined";
              var sourceErr = " " + err + " ";
              if(sourceErr.indexOf(minedPending) !== -1)
              {
                var rtnObj = {
                  "status" : "pending",
                  "data" : err,
                  "errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                  };
  
                callback(rtnObj.valueOf());  
              }
              else
              {
                
                callback("ERROR 404");
                
              }
            });
              
            });

    },

     changeParameters: function(crowdsaleStartTime,crowdsaleEndTime,CLCPerEther,CLCPerBitcoin,CLCPerDollar,callback) {
        var web3 = new Web3(config.INFURA_ENDPOINT + config.INFURA_KEY);
        var contractInstance = new web3.eth.Contract(clickcoin_artifact.abi, config.CONTRACT_ADDRESS, {
            from: config.OWNER_ADDRESS
        });
        var txnNonce;
        var txnObject;

        web3.eth.getTransactionCount(config.OWNER_ADDRESS,'pending')
        .then(function(data){
          txnNonce = data;
          (txnNonce);
          txnObject = {
            from : config.OWNER_ADDRESS,
            to : config.CONTRACT_ADDRESS,
            value : "0x0",
            gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
            gas: web3.utils.toHex('3000000'),
            nonce: web3.utils.toHex(txnNonce),
            data: contractInstance.methods.changeParameters(web3.utils.toBN(crowdsaleStartTime).toString(),web3.utils.toBN(crowdsaleEndTime).toString(),web3.utils.toBN(CLCPerEther).toString(),web3.utils.toBN(CLCPerBitcoin).toString(),web3.utils.toBN(CLCPerDollar).toString()).encodeABI()
          };
  
          (txnObject);
  
          var Tx = require('ethereumjs-tx');
          var privateKey = new Buffer(config.PRIV_KEY, 'hex');
  
          var tx = new Tx(txnObject);
          tx.sign(privateKey);
  
          var serializedTx = tx.serialize();
          (serializedTx);
  
          web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', function(receipt){
              ("Receipt Called");
              callback(null,"Crowdsale Stage Started");
            
            }).on('error', function(err){
              ("Error Called: "+ err);
  
              var minedPending = "Be aware that it might still be mined";
              var sourceErr = " " + err + " ";
              if(sourceErr.indexOf(minedPending) !== -1)
              {
                var rtnObj = {
                  "status" : "pending",
                  "data" : err,
                  "errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
                  };
  
                callback(rtnObj.valueOf());  
              }
              else
              {
                
                callback("ERROR 404");
                
              }
            });
              
            });

    },
    sendSignedTransactionAdmin : async (rawTx, contractAddress, callback) => {
        const seed = await bip39.mnemonicToSeed(config.ADMIN_MNEMONIC);
        console.log("seed", seed)
        const hdk = hdkey.fromMasterSeed(seed);
        console.log("hdk", hdk)
        const addr_node = hdk.derivePath("m/44'/60'/0'/0/0"); //m/44'/60'/0'/0/0 is derivation path for the first account. m/44'/60'/0'/0/1 is the derivation path for the second account and so on
        console.log("addr_node", addr_node)
        const addr = addr_node.getWallet().getAddressString(); //check that this is the same with the address that ganache list for the first account to make sure the derivation is correct
        console.log("addr............", addr)
        const private_key = addr_node.getWallet().getPrivateKey();
        console.log("private_key", private_key)
        
            let nonce = await web3.eth.getTransactionCount(addr, 'pending')
              nonce = nonce.toString(16);
              console.log("Nonce: " + nonce);
              const txParams = {
                gasPrice: 100000000000,
                gasLimit: 3000000,
                to: contractAddress,
                data: rawTx,
                from: addr,
                nonce: '0x' + nonce
              };
              console.log("txparms..: ", txParams);
              const tx = new Tx(txParams, {chain:'ropsten', hardfork: 'petersburg'});
              tx.sign(private_key); // Transaction Signing here
          
              const serializedTx = tx.serialize();
              console.log("serializedTx:........................ " , serializedTx);
              let txHash, receipt1;
              web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                .on('transactionHash', function (hash) {
                    callback(null, hash);
                })
                .on('receipt', function (receipt) {
                    console.log("Receipt Called.......................", receipt);
                }).on('error', function (err) {
                    callback(err, err);
                });
      }

}

