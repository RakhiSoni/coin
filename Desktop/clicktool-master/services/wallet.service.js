// Get wallet model.
const Wallet = require('../models/wallet');
const truffle_connect = require('../connection/app.js');
const clicktoolSCAddress = "0xd636b56fc0d751f54c3dcec2cf8283eb714172aa";
const constants = require('../modules/constants');
var common = require('./common.service');
const axios = require('axios');
const async = require('async');
const _ = require('lodash');
const stripHexPrefix = require('strip-hex-prefix');
const Transaction = require('../models/Transaction');
const User = require('../models/Member');
const Referral = require('../models/Referral');
const TokenList = require('../models/TokenList');
const notification = require('./notification.service');
var waterfall = require('async-waterfall');
var moment = require('moment');
var bitpay = require('bitpay-rest');
//var bitauth = require('bitauth');
var fs = require('fs');
//var privkey = bitauth.decrypt('', fs.readFileSync(constants.SERVER_PATH + '/.bitpay/api.key', 'utf8'));
var cron = require('node-cron');
const commonService = require("../services/common.service");
const {abi} = require("../contractConfig/abi");
const Web3 = require("web3");
const provider = 'https://ropsten.infura.io/v3/5cfea0d474d94d178f030574a25eee02';
const web3 = new Web3(provider);
let bigdecimal = require("bigdecimal");
const mailer = require('../modules/mailer');

exports.addWallet = function (req, data, callback) {
    var mnemonic = data.mnemonic;
    var name = data.name;
    truffle_connect.addNewWallet(req, mnemonic, name, function (error, objWallet) {
        if (!error) {
            callback(null, objWallet);
        } else {
            callback(error, error);
        }
    });
};

exports.getSavedWallets = async function (req, data, callback) {
    try{
    const wallets = [];
    const foundWallets = await Wallet.find({'memberId': req.authenticationId.userId, 'isDelete': 0});
        if (foundWallets && foundWallets.length > 0) {
            const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS);
            if(contract){
            const promiseArray = foundWallets.map(async item =>  {
                const wei = await web3.eth.getBalance(item.walletAddress);
                const tac  = await contract.methods.balanceOf(item.walletAddress).call();
                    if (wei && tac) {
                        let balance = await web3.utils.fromWei(wei, 'ether');
                        item.balance = tac / (constants.TAC_DECIMALS);
                        item.ethers = balance;
                    }
                });
                const result  = await Promise.all(promiseArray);
                if(result) {
             
                    callback(null, foundWallets);
                }
                else callback("Error", [])
            } else  callback("Error", [])
        } else  callback(null, wallets)
    }
    catch(err){
        console.log("Error occurred in Get wallets API");
        callback(err, []);
    }
}

exports.setDefaultWallet = function (req, data, callback) {

    Wallet.find({'memberId': req.authenticationId.userId}, function (err, wallets) {
        if (wallets) {
            Wallet.update({'memberId': req.authenticationId.userId, defaultAddress: true}, {defaultAddress: false}, {multi: true}, function (er, set) {
                if (set) {
                    Wallet.update({_id: data.id}, {defaultAddress: true}, function (e, defaultset) {
                        if (defaultset) {
                            callback(null, defaultset);
                        } else {
                            callback(e, {});
                        }
                    });
                } else {
                    callback(er, {})
                }
            });
        } else {
            callback(err, {});
        }
    }
    );
};
exports.deleteWalletAddress = function (req, data, callback) {

    Wallet.findOne({'memberId': req.authenticationId.userId, _id: data.id, defaultAddress: false, inUse: false}, function (err, wallet) {
        if (wallet) {
            truffle_connect.getAccountBalance(wallet.walletAddress, function (error, ethers) {
                (ethers);
                if (ethers != 0) {
                    callback('error', 'Can not Delete Wallet with ethers.');
                } else {
                    Wallet.update({'memberId': req.authenticationId.userId, _id: data.id, defaultAddress: false, inUse: false}, {$set: {'isDelete': 1}}, function (err, wallet) {
                        if (wallet.ok == 1 && wallet.n == 0) {
                            callback('error', 'Can not Delete Default Wallet or in Used wallet.');
                        } else if (wallet.ok == 1 && wallet.n == 1) {
                            callback(null, wallet);
                        } else {
                            callback(err, {});
                        }
                    }
                    );
                }
            });
        } else {
            callback('error', 'Can not Delete Default Wallet or in Used wallet.');
        }
    });

};
exports.editWallet = function (req, data, callback) {

    Wallet.update({'memberId': req.authenticationId.userId, _id: data.id}, {$set: {'name': data.name}}, function (err, wallet) {
        if (wallet) {
            callback(null, wallet);
        } else {
            callback(err, {});

        }
    }
    );
};
exports.getTotalEtherEstimate = function (data, callback) {
    try {
        var amount_of_tokens = data.tokens;
        var wallet_address = data.wallet_address;
        var ckc_per_ether = data.ckc_per_ether;
        var amount = amount_of_tokens / ckc_per_ether;
        ("amount", amount);
        ("wallet", wallet_address);
        truffle_connect.getGasEstimate(amount, wallet_address, function (error, gasUsedInEther, totalEther) {
            if (!error) {

                callback(null, amount_of_tokens, amount, gasUsedInEther, totalEther);
            } else {
                callback(error, error);
            }
        })
    } catch (exception) {
        ("2");
        callback("something_went_wrong", {});
    }

}

exports.addHDWallet = function (req, data, callback) {

    truffle_connect.createHDWallet(req, function (err, mnemonic, address, name) {
        //("w",w);
        if (err) {
            callback(err, {});
        } else {
            callback(null, mnemonic, address, name);
        }

    });

};

exports.retrieveHDWallet = function (req, callback) {

    truffle_connect.retrieveWallet(req, function (err, w) {
        //("w",w);

        if (!err) {
            callback(null, "Correct")

        } else if (err = "wrong_mnemonic") {
            callback("wrong_mnemonic", "mnemonic wrong");
        } else {
            callback(err, {});
        }
    });

};

exports.buyTACTokens = async function (req, data, callback) {
    wallet_address = data.wallet_address;
    privatekey = req.privateKey;
    amount_of_tokens = data.tokens;
    console.log("777777777777777777777777777...................", amount_of_tokens);
    console.log("********************************************");
    const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS);
    if (contract) {
      const currentRound = await contract.methods.currentStage().call();
      if(currentRound >= 0 && currentRound <= 3){
        let round = await contract.methods.rounds(currentRound).call();
        const currentRoundRateInCents = round.rate;
        let ethToUsd = await commonService.getETHToUSD();
        const usdToEth = currentRoundRateInCents / (ethToUsd * 100);
        let amount = amount_of_tokens * usdToEth;
        console.log("888888888888888888888...................", round,  currentRoundRateInCents, ethToUsd, amount);
        console.log("********************************************");
        truffle_connect.getAccountBalance(wallet_address, async function (error, ethers) { 
            console.log("99999999999999999999999...................", error, ethers, ethers >= amount);
        console.log("********************************************");     
            if (!error) {
                if (ethers >= amount){
                    truffle_connect.buyTACToken(req, constants.ABUNDANCE_CONTRACT_ADDRESS, wallet_address, privatekey, amount, amount_of_tokens, async function (error, txhash) {
                        if (!error) {
                            const user = await User.findOne({_id : req.authenticationId.userId});
                            let result2;
                            console.log("14.14.14.14.14.14.14.14...................", user, user.referredBy, user.isFirstTx);
        console.log("********************************************");
                            if (user && user.referredBy){
                            user.firstTransactionHash = txhash;
                            
                            const referredUser = await User.findOne({referralCode : user.referredBy});
                            console.log("bla bla blaaa.....................", referredUser, referredUser.referralCode.toString() == user.referredBy.toString() , referredUser.referralCode == 'zCKiXaFo', user.referredBy);
        console.log("********************************************");
                            if(referredUser){
                                let referredTokenCount;
                                if(data.tokens > 0 && data.tokens <= 500) referredTokenCount = 0.01 * data.tokens;
                                else if(data.tokens > 500 && data.tokens <= 1000) referredTokenCount = 0.03 * data.tokens;
                                else if(data.tokens > 1001 && data.tokens <= 2500) referredTokenCount = 0.05 * data.tokens;
                                else if(data.tokens > 2500 && data.tokens <= 7000) referredTokenCount = 0.07 * data.tokens;
                                else if(data.tokens > 7000 && data.tokens <= 20000) referredTokenCount = 0.1 * data.tokens;
                                else if (data.tokens > 20000) referredTokenCount = 0.15 * data.tokens;
                                else return callback(null, txhash);
                            referredUser.referralCount = referredUser.referralCount + 1;
                            referredUser.referralTokenCount += referredTokenCount;
                            console.log("15.15.15....................", referredUser, referredUser.referralTokenCount, referredTokenCount);
        console.log("********************************************");
                            //Get the  default Wallet and transfer tokens
                            //Send Tokens
                            const defaultWalletAddress = await Wallet.findOne({memberId : referredUser._id , defaultAddress : true});
                            if(defaultWalletAddress){
 const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS, {
                                    gasLimit: 3000000,
                                  });
                            let tokens = web3.utils.toWei(referredTokenCount.toString(), 'ether')
                            console.log("16.16.16....................", defaultWalletAddress);
                            console.log("********************************************");
                            let bntokens = web3.utils.toBN(tokens);
                            const contractFunction = contract.methods.transferAnyERC20Token(defaultWalletAddress.walletAddress, bntokens); // Here you can call your contract functions
                            //const contractFunction = contract.methods.transferAnyERC20Token(defaultWalletAddress.walletAddress, bntokens, false, true); // Here you can call your contract functions

                            const functionAbi = contractFunction.encodeABI();
                            console.log("17.17.17....................", functionAbi);
                            console.log("********************************************");
                            commonService.sendSignedTransactionAdmin(functionAbi, async function (error, txHash) {
                               if(!error){
                                console.log("18.18.18....................", txHash);
                                console.log("********************************************");
                                const date = new Date();
                                   referredUser.referralTokenTransactions.push({

                                        date : date.getTime(),
                                        txHash : txHash,
                                        userName : user.firstname + " " +  user.lastname,
                                        tokenCount : referredTokenCount,
                                        txURL : `https://ropsten.etherscan.io/tx/${txHash}`
                                    });
                                    var templateVariable = {
                                        templateURL: 'mailtemplate/referral',
                                        name: referredUser.firstname + " " + referredUser.lastname,
                                        from : user.firstname + " " +  user.lastname,
                                        tokenCount : referredTokenCount,
                                        txURL : `https://ropsten.etherscan.io/tx/${txHash}`
                                      };
                                      var mailParamsObject = {
                                        templateVariable: templateVariable,
                                        to: referredUser.email,
                                        subject: 'You have received referral Rewards'
                                      };
                                      mailer.sendMail(mailParamsObject, function(err) {
                                        if (err) console.log('Mail not sent in referral');
                                      });
                                    // result = await user.save();
                                    result2 = await referredUser.save();
                                    if(result2){ console.log("DaTa saved");
                                    return  callback(null, txhash);}
                                    else return callback(null, txhash);
                                }
                                else { console.log("22222"); return callback(null, txhash);}
                            });
                            }
                            else { console.log("33333");return callback(null, txhash);}
                        } else { console.log("5454345434");return callback(null, txhash);}
                        } else { console.log("4444"); return callback(null, txhash);}
                    } else { console.log("5555");return callback(error, error);  }
                    });
                } else { console.log("666");return callback("insufficient_balance","You dont have enough balance to execute transaction");}
            } else { console.log("777 ");return callback(error, error);}
        });
      } else callback("Sale is not ON", "Please try during sale period.");
} else callback("Error connecting to Ethereum network.", "Please try again later");
  
};


exports.buyCKCTokens = function (req, data, callback) {
    ckc_per_ether = data.ckc_per_ether;
    (data.ckc_per_bitcoin) ? (ckc_per_bitcoin = data.ckc_per_bitcoin) : (ckc_per_bitcoin = null);
    wallet_address = data.wallet_address;
    privatekey = req.privateKey;
    ("prrr", privatekey);
    amount_of_tokens = data.tokens;
    var amount;
    ("ether", ckc_per_ether);
    ("btc", ckc_per_bitcoin);
    if (ckc_per_ether) {
        //return await 

        amount = amount_of_tokens / ckc_per_ether;
        ("amttt", amount);

        truffle_connect.getAccountBalance(wallet_address, function (error, ethers) {                 
            
            if (!error) {

                if (ethers >= amount){
                    ("Ethers",ethers);
                    truffle_connect.buyToken(req, constants.CONTRACT_ADDRESS, wallet_address, privatekey, amount, amount_of_tokens, function (error, txhash) {
                        //("remEtherAmount",remEtherAmount);
                        if (!error) {
                            var firstTx = false;
                            waterfall([
                                function (callback1) {
                                    Transaction.find({memberId: req.authenticationId.userId}, function (err, foundTx) {
                                        if (err) {
                                            ("err while finding tx of member id", err)
                                        } else if (foundTx.length == 0) {
                                            firstTx = true
                                        }
                                        ("foundTx", foundTx);
                                        ("firstTx", firstTx);
                                        callback1(null, firstTx);
                                    })
                                },
                                function (firstTransaction, callback2) {
                                    var newTransaction = new Transaction({
                                        transactionHash: txhash,
                                        from: wallet_address,
                                        to: constants.CONTRACT_ADDRESS,
                                        ether: amount * constants.DECIMALS,
                                        coins: amount_of_tokens * constants.DECIMALS,
                                        transactionType: "buy",
                                        paymentType: "ether",
                                        currencyType: "C",
                                        memberId: req.authenticationId.userId,
                                        transactionStatus: "pending",
                                        isFirstTx: firstTransaction,
                                        date: moment().unix()
                                    });
                                    ("newww", newTransaction.date);
                                    newTransaction.save(function (err, savedTx) {
                                        if (err)
                                        {
                                            ("err", err);
                                        }
                                        ("savedTransaction", savedTx);
                                        callback2(null, "done");
                                    });
                                }
            
                            ], function (error, result) {
                                if (error) {
                                    ("error in water fall", error);
                                }
                                ("result", result);
                            })
                            callback(null, txhash);
                        }
                        // } else if (error == 'insufficient_balance') {
                        //     ("error msg", error);
                        //     callback("insufficient_balance", 'You dont have enough balance to execute transaction');
                        // } 
                        else {
                            callback(error, error);
                        }
                    });
                
                }
                else {
                    ("amountfff",amount);
                    // var notidata = {
                    //     type: "transaction_notification",
                    //     title: "Clicktool – Transaction Failed",
                    //     message: "You dont have enough balance to execute transaction",
                    //     createdAt: moment(),
                    //     coins: amount_of_tokens,
                    //     email_temp: 'transaction_failed'
                    // };
                    // notification.notifyUser(req.authenticationId.userId, notidata, function (d) {
                    //     ("notifications",d);
                    // });
                    callback("insufficient_balance","You dont have enough balance to execute transaction");
                }
            
            } else {
                callback(error, error);
            }
        
        });
        
//	n4dxhB3yhuAEgDVW2LphVEn4khQCSiKhPW
//  moV1vM1uzuSgRSgAy8ZzV6LPSC6GzjAD3L

}

};

exports.buyWithBTC = function (req, data, callback) {
    amount = data.price;
    email = data.buyerEmail;
    redirectUrl = (data.redirecturl) ? data.redirecturl : constants.ACCESSURL;
    notificationURL = (data.notificationURL) ? data.notificationURL : constants.NOTIFICATION_OF_PAYMENT + "?token="+req.authenticationId.userId;
    ("nnn",notificationURL);
    var client = bitpay.createClient(privkey, {
        config: {
            apiHost: constants.BITPAY_API,
            apiPort: 443,
            forceSSL: false
        }
    });
    client.on('error', function (err) {
        // handle client errors here
        (err);
        callback(err, err);
    });

    client.on('ready', function () {
        var data = {

            price: amount,
            currency: "BTC",
            redirectURL: redirectUrl,
            notificationURL: notificationURL,
            fullNotifications: true,
            notificationEmail: constants.NOTIFICATION_OF_BITPAY_PAYMENTS,
            buyerEmail: email

        };

        // NOTE: the .as('pos') is necessary for Point of Sale requests, use as('merchant') if you have a merchant token instead
        client.as('merchant').post('invoices', data, function (err, invoice) {
            if (err) {
                // more error handling
                (err);
                callback(err, err);
            } else {
                // success
                ('invoice data', invoice);
                callback(null, invoice);

            }
        });
    });
    // need bitauth too

}
exports.getWallet = function (req, data, callback) {
    address = data.wallet_address;
    truffle_connect.getWalletDetail(address, function (walletdata) {
        ("wallet", walletdata);
        callback(null, walletdata);
    })
}

const kycReply = async (memberId) => {
    let data = {
    kycStatus : '',
    kycMessage : ''
    }
    const user = await User.findOne({_id : memberId});
    if(user){
    if(user.kyc && user.kyc.isVerified){
    if(user.kyc.isVerified == 0){
    data.kycStatus = 0;
    data.kycMessage = "KYC Not Submitted";
    return data;
    }
    else if(user.kyc.isVerified == 1){
    data.kycStatus = 1;
    data.kycMessage = "KYC Under Review";
    return data;
    }
    else if (user.kyc.isVerified == 2){
    data.kycStatus = 2;
    data.kycMessage = "KYC Verified";
    return data;
    }
    else if(user.kyc.isVerified == 3){
    data.kycStatus = 3;
    data.kycMessage = "KYC Verification Failed";
    return data;
    }
    else {
    data.kycStatus = 0;
    data.kycMessage = "KYC Not Submitted";
    return data;
    }
    }
    else {
    data.kycStatus = 0;
    data.kycMessage = "KYC Not Submitted";
    return data;
    }
    }else {
    data.kycStatus = 0;
    data.kycMessage = "KYC Not Submitted";
    return data;
    }
}

exports.getDashboardDetails = async function (req, data, callback) {
//     req.authenticationId = {
//     userId : '5dfc739a2fd6c002a797b8de'
//   }
    try { 
        const wallet = await Wallet.findOne({ memberId: req.authenticationId.userId, defaultAddress: true });
        if (wallet) {
            const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS);
            let tokenBalance = await contract.methods.balanceOf(wallet.walletAddress).call();
            let etherBalance = await web3.eth.getBalance(wallet.walletAddress);
            wallet.ethers = etherBalance;
            const kycMessage = await kycReply(req.authenticationId.userId);
            console.log("kyc..", kycMessage);
            wallet.balance = tokenBalance / constants.TAC_DECIMALS;
            finalPrices = {
                'kycMessage' : kycMessage ? kycMessage.kycMessage : 'KYC Not Submitted',
                'kycStatus' : kycMessage ? kycMessage.kycStatus : 0,
                'totalBalance': tokenBalance / constants.TAC_DECIMALS,
                'totalNetWorth': 0,
                'bitcoinWalletAddress': constants.BITCOIN_ADDRESS,
                'etherWalletAddress': constants.ABUNDANCE_CONTRACT_ADDRESS,
                'defaultWallet': wallet,
            };
                callback(null, finalPrices);         
                }
                else callback("Wallet Not found", null);
           
    } catch (exception) {
    console.log("Error occurred in mobile dashboard", exception);
    callback("Error Occurred", null);}
    
    };
 

function transferEtherReward() {
    Referral.find({rewardStatus: "pending"}, function(error,rewardFound) {
        async.eachSeries(rewardFound, function (val, callbackS) {
            // data1.totalEathers = parseFloat(val.etherRewarded) + parseFloat(data1.totalEathers);
            // data1.totalEathers = (data1.totalEathers / config.DECIMALS);
            // var refer = {};
            // refer.etherRewarded = (val.etherRewarded / config.DECIMALS);
            // refer.amountOfEther = (val.amountOfEther / config.DECIMALS);
            // refer.dateAssigned = val.dateAssigned;
            // user.findOne({_id: val.userIdThatBuys}, function (error, userdata) {
            //     //(userdata);
            //     if (userdata) {
            //         refer.fullname = userdata.firstname + ' ' + userdata.lastname;
            //         referes.push(refer);
            //         // ("referes",referes);

            //         // ('test caklsndlansndasdnl', refer.fullname);
            //     } else {
            //         (error);
            //     }
            //     callbackS();
            // });
            // ("222222")
            //("refer",refer);
            var nowTime = moment();
            var thenTime = moment(val.dateAssigned);
            ("date",val.dateAssigned);
            ("then",thenTime);
            ("nowTime",nowTime);
            var duration = moment.duration(nowTime.diff(thenTime));
            var days = duration.asDays();
            var ether = val.etherRewarded / constants.DECIMALS;
            ("dayss",days);
            if (days >= 7) {
                Wallet.findOne({memberId: val.userIdThatRefers,defaultAddress:true}, function(error,wallet) {
                        (wallet);
                    if (!error) {
                        truffle_connect.transferEther(wallet.walletAddress,val.etherRewarded.toFixed(0), function(err,doneReward) {
                            if (!err) {
                                ("Send Ethers");
                                rewardFound.rewardStatus = "completed";
                                rewardFound.save(function(err,savedRef) {
                                    if (err){
                                        ("err saving status")
                                    }
                                    else {
                                        ("saved status");
                                        callbackS();
                                    }
                                })
                                
                            }
                        })

                    }
                })
            }
            else {
                callbackS();
            }
            

        }, function () {
            ("11111");
            
            
            ("final ether transferred")
            
        });

    })
}

exports.paymentStatus = function (req, data, callback) {

   ("dattaaa",data);
   ("reqqqq",req.query);
  
   if (data.status == "paid") {
    
    waterfall([

        
        function (callbackOne) {
            axios.get(constants.BITPAY_URL + "/invoiceData/" + data.id)
            .then(function (response) {
                ("ressss",response);
                var txid = response.data.invoice.transactions[0].txid;
                ("Transaction Id", txid);
                callbackOne(null, txid);
            })
            .catch(function (error) {
                // handle error
                ("error1111",error);
                callback(error, error);
            });
        
        },
        function (txid, callbackTwo) {
            axios.get(constants.INSIGHT_BITPAY_URL + "/api/tx/" + txid)
            .then(function (response1) {
                var addr1 = response1.data.vin[0].addr;
                var addr2 = response1.data.vout[1].scriptPubKey.addresses[0];
                var value = response1.data.vout[1].value;
                ("addr1", addr1);
                ("addr2",addr2);
                ("vale",value);
                callbackTwo(null, txid,addr1,addr2);
            })
            .catch(function (error) {
                // handle error
                ("error222",error);
                callback(error, error);
            });
        
        },
        function (txid, address1, address2, callbackThree) {
              var newTransaction = new Transaction({
                transactionHash: txid,
                from: address1,
                to: address2,
                ether: 0,
                bitcoin: data.price * constants.BTC_CONST,
                coins: 0,
                transactionType: "send",
                currencyType: "B",
                memberId: req.query.token,
                transactionStatus: "pending",
                date: data.currentTime,
                invoiceId: data.id
              });
               ("newww", newTransaction.date);
                newTransaction.save(function (err, savedTx) {
                    if (err)
                    {
                        ("err", err);
                    }
                    ("savedTransaction", savedTx);
                    callbackThree(null, txid);
                });
        }, 
        function (txid,callbackFour) {
            var firstTx = false;
            Transaction.find({memberId: req.query.token}, function (err, foundTx) {
                if (err) {
                    ("err while finding tx of member id", err)
                } else if (foundTx.length == 0) {
                    firstTx = true
                }
                ("foundTx", foundTx);
                ("firstTx", firstTx);
                callbackFour(null, txid,firstTx);
            })
      }, 
        
        function (txid,firstTx,callbackInit) {

            truffle_connect.getRoundPrices(function (error, prices) {
                
                    if (!error) {
                        ("prices",prices);
                        Wallet.findOne({'memberId': req.query.token,defaultAddress: true}, function (err, wallet) {
                            if (wallet) {
                                ("wallet",wallet);
                                
                                var newTransaction = new Transaction({
                                    transactionHash: txid,
                                    from: wallet.walletAddress,
                                    to: constants.CONTRACT_ADDRESS,
                                    ether: 0,
                                    bitcoin: data.price * constants.BTC_CONST,
                                    coins: prices[1] * data.price,
                                    transactionType: "buy",
                                    currencyType: "C",
                                    paymentType: "bitcoin",
                                    memberId: req.query.token,
                                    transactionStatus: "pending",
                                    isFirstTx: firstTx,
                                    date: data.currentTime,
                                    invoiceId: data.id
                                  });

                                  newTransaction.save(function (err, savedTx) {
                                    if (err)
                                    {
                                        ("err", err);
                                    }
                                    ("savedTransaction", savedTx);
                                    callbackInit(null, "done");
                                });
                            } 
                        });            
                    } else {
                        callback(error,error);
                    }
            });

            
        },
        

    ], function (error, result) {
        if (error) {
            ("error in water fall", error);
        }
        else {
            ("result", result);
        }
       
    })

   }

   else if (data.status == "complete") {
    waterfall([
        function (callbackOne) {
            Transaction.find({invoiceId: data.id,currencyType:"B"}, function (err, foundTxn) {
                if (err) {
                    ("err while finding tx of member id", err)
                } else {

                    foundTxn.transactionStatus = "completed";
                    foundTxn.date = moment().unix();

                    foundTxn.save(function (err1) {
                            if (err1) {
                                ("error saving txn");
                            }
                            else {
                                ("saved BTC transaction");
                                callbackOne(null,"done");
                            }
                        });
                    }
                
            })
            
        },

        function (callbackTwo) {
            Transaction.find({invoiceId: data.id,currencyType:"C"}, function (err, foundTxns) {
                if (err) {
                    ("err while finding tx of member id", err)
                } else {

                    foundTxns.transactionStatus = "completed";
                    foundTxns.date = moment().unix();

                    foundTxns.save(function (err1) {
                            if (err1) {
                                ("error saving txn");
                            }
                            else {
                                ("saved CLC transaction");

                                truffle_connect.buyTokenWithBTC(foundTxns.from,foundTxns.coins,function(err,objBTC) {
                                    if (!err) {
                                        ("Tokens bought with btc");

                                        Wallet.findOne({walletAddress: foundTxns.from}, function (error, wallet) {
                                            if (wallet) {
                                                var totalBalance = ((wallet.balance + (foundTxns.coins * config.CKC_CONST)));
                                                var notidata = {
                                                    type: "transaction_notification",
                                                    title: "Clicktool – Successful Transaction",
                                                    message: "Your purchase of " + foundTxns.coins + " Clickcoin has been successful. Your updated balance is " + totalBalance / config.CKC_CONST,
                                                    createdAt: moment(),
                                                    totalBalance: (totalBalance / config.CKC_CONST),
                                                    coins: foundTxns.coins,
                                                    email_temp: 'transaction_success'
            
                                                };
                                                notification.notifyUser(req.query.token, notidata, function (d) {
                                                    (d);
                                                });
                                                Wallet.update({walletAddress: foundTxns.from}, {$set: {balance: totalBalance, inUse: true}}, function (err, succ) {
                                                    if (succ) {
                                                        (succ);
                                                        callbackTwo(null,foundTxns);
                                                    } else {
                                                        (err);
                                                    }
                                                });
                                            } else {
                                                (error);
                                            }
                                        });
                                        
                                    }
                                    else {
                                        ("error in txn btc");
                                    }
                                })
                               
                            }
                        });
                    }
                
            })
            
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
        function (transaction,buyingMember, callback22) {
            common.getEtherPrice(function (ethbrc) {
                callback22(null, transaction,buyingMember,ethbtc);
            });
        },
        function (transaction, buyingMember, ethbtc, callback3) {
            Member.findOne({referralCode: buyingMember.referredBy}, function (err3, referredByMember) {
                if (err3) {
                    ("err while finding member is having referral code or not", err3);
                    callback3('error', err3);
                } else {

                    var ethequToBTC = transaction.bitcoin / ethbtc;
                    var newReferral = new Referral({
                        userIdThatBuys: buyingMember._id,
                        userIdThatRefers: referredByMember._id,
                        amountOfEther: ethequToBTC,
                        //amountOfBitcoin: transaction.bitcoin,
                        etherRewarded: (ethequToBTC * 7) / 100,
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
        }
        else {
            ("result", result);
        }
       
    })
   }
 
};

//https://test-insight.bitpay.com/tx/9cb4edd014aa96b7424a33bb825965756731d7b62efe325771559086c1443d6f

exports.getTokens = function (data, callback) {
    TokenList.find({}, function (err, tokens) {
        ("ttt",tokens.length);
        if (tokens.length > 0) {
            ("tokkkens",tokens);
            callback(null, tokens);
        }
        else {
            callback(err, []);
        }
    });
}

exports.selectedTokens = function (data,callback) {
    var wallet_address = data.wallet_address;
    var token_ids = JSON.parse(data.token_ids);
    ("tokens_ids",token_ids.length);

        Wallet.update({walletAddress: wallet_address}, { $set: { selectedTokens: token_ids } }, function (e, walletFound) {
            if (walletFound) {
               ("Tokens Added");
               callback(null,"Tokens Added");
            } else {
                callback(e, {});
            }
        });
      
}


