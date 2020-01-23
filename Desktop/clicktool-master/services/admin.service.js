// Get wallet model.
var wallet = require('../models/wallet');
var AdminUser = require('../models/AdminUser');
const truffle_connect = require('../connection/app.js');
const constants = require('../modules/constants');
const jwt = require('jsonwebtoken');
var role = require('../models/Role');
var member = require('../models/Member');
var Transaction = require('../models/Transaction');
var Referral = require('../models/Referral');
var wallet = require('../models/wallet');
var Admin = require('../models/Admin');
var len = require('object-length');
var _this = this;
var _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
const async = require('async');
const notification = require('./notification.service');
const bcrypt = require('bcryptjs');
var randomstring = require('randomstring');

var generateAccessToken = function(userId) {
  var Client = require('node-rest-client').Client;
  return (token = jwt.sign(
    {
      id: userId
    },
    constants.SECRET,
    {
      expiresIn: '1h' // expires in 24 hours
    }
  ));
};

exports.generateAccessToken = generateAccessToken;

exports.getAccessTok = async function(data, callback) {
  const a = await AdminUser.findOne({ email: data.email });
  const b = await AdminUser.findOne({});
  var email = data.email;
  var password = data.password;
  var token;
  var error;
  //(';password',password);
  AdminUser.findOne({ email: email }, function(err, adminUser) {
    'aaa', adminUser;
    if (adminUser) {
      'admin', adminUser.toObject();
      'admin pass', adminUser.toObject().password;
      var admin = adminUser.toObject();
    } else {
      'admin', adminUser;
      error = 1;
      callback(null, { error: error, message: 'Given User is not an Admin' });
      return false;
    }

    if (!admin) {
      error = 1;
      callback(null, { error: error, message: 'Given User is not an Admin' });
    } else if (admin && bcrypt.compareSync(password, admin.password) != true) {
      error = 1;
      callback(null, { error: error, message: 'Your Password is wrong' });
    } else if (admin && admin.isActive == false) {
      error = 1;
      callback(null, { error: error, message: 'Your Account is Deactive please contact Administration' });
    } else if (err) {
      callback(err, err);
    } else {
      token = generateAccessToken(admin._id);
      adminUser.accessToken = token;
      adminUser.save(function(err1) {
        if (err1) {
          'error', err1;
          callback(err1, err1);
        } else {
          ('Token Updated Successfully');
        }
      });
      callback(null, { token: token, message: 'Login Successful' });
    }
  });
};

exports.getTokenBal = function(callback) {
  truffle_connect.getTokenBalances(function(error, initialSupply, tokensRemaining, tokensSold) {
    if (!error) {
      var initialSupply = initialSupply / constants.DECIMALS;
      var tokensRemaining = tokensRemaining / constants.DECIMALS;
      var tokensSold = tokensSold / constants.DECIMALS;
      'initial', initialSupply;
      'tokensRem', tokensRemaining;
      'tokensSold', tokensSold;

      callback(null, initialSupply, tokensSold, tokensRemaining);
    } else {
      'error', error;
      callback(error, error);
    }
  });
};

exports.getCrowdsaleDashboard = function(index, callback) {
  var roundDetails = [];
  var response = {};
  var callBackString = {};

  truffle_connect.getCrowdsaleRoundDetails(index, function(error2, details) {
    if (!error2) {
      truffle_connect.getCrowdsaleRoundPrices(function(error3, prices) {
        if (!error3) {
          _.forEach(details, function(d1) {
            roundDetails.push(d1);
          });

          _.forEach(prices, function(p1) {
            roundDetails.push(p1);
          });

          response = {
            roundName: roundDetails[0],
            roundStartDate: moment
              .unix(roundDetails[1])
              .utc()
              .format('YYYY-MM-DD HH:mm:ss'),
            roundEndDate: moment
              .unix(roundDetails[2])
              .utc()
              .format('YYYY-MM-DD HH:mm:ss'),
            roundTokensSold: (roundDetails[3] / constants.DECIMALS).toFixed(0),
            roundEthRaised: roundDetails[4],
            percentOfTokensAvailable: roundDetails[5],
            roundBonusPercent: roundDetails[6]
          };

          callback(null, response, prices);
        } else {
          'error', error3;
          callback(error, error3);
        }
      });
    } else {
      'error', error2;
      callback(error, error2);
    }
  });
};

exports.getUsers = function(callback) {
  member
    .find({}, function(error, users) {
      if (users) {
        _.forEach(users, function(user, key) {
          user.profilePicture != null && user.profilePicture != undefined
            ? (user.profilePicture = constants.ACCESSURL + 'uploads/profile_picture' + user.profilePicture)
            : (user.profilePicture = '');
          user.createdAt != null && user.createdAt != undefined ? (user.createdAt = user.createdAt) : (user.createdAt = '');
        });
        callback(null, { users: users });
      } else {
        callback(null, {});
      }
    })
    .select('-password -secretAccessKey -passwordConfirm -passwordResetToken -fcmToken');
};

exports.getWallets = function(callback) {
  wallet.find({}, function(error, wallets) {
    if (wallets) {
      callback(null, { wallets: wallets });
    } else {
      callback(null, {});
    }
  });
};

exports.transferTokens = function(callback) {
  truffle_connect.transferTokensToUsers(function(error, noOfTokens) {
    if (!error) {
      callback(null, noOfTokens);
    } else {
      'error', error;
      callback(error, error);
    }
  });
};

exports.airdropExecute = function(add, tok, callback) {
  var tokensSoldAirdrop = 0;
  _.forEach(tok, function(val, key) {
    tokensSoldAirdrop = tokensSoldAirdrop + parseInt(val);
  });
  truffle_connect.checkAirdrop(function(error, objSupply) {
    if (!error) {
      tokensSoldAirdrop;
      'supply', objSupply;
      if (tokensSoldAirdrop * constants.DECIMALS <= objSupply) {
        truffle_connect.executeAirdrop(add, tok, function(error, objAirdrop) {
          if (!error) {
            callback(null, objAirdrop);
          } else {
            'error', error;
            callback(error, error);
          }
        });
      } else {
        ('tokens exceeded');
        callback('exceed', 'Tokens exceed the airdrop supply');
      }
    } else {
      callback(error, error);
    }
  });
};

exports.userTxns = function(data, callback) {
  'data', data;
  var userId = data.user_id;
  'userr', userId;
  Transaction.find({ memberId: userId, currencyType: 'C' }, function(error, objTransactions) {
    if (!error) {
      'Data Found', objTransactions;
      callback(null, objTransactions);
    } else {
      callback(error, error);
    }
  }).select('-isFirstTx');
};

exports.userReferral = function(data, callback) {
  'data', data;
  var userId = data.user_id;
  'userr', userId;
  Referral.find({ userIdThatRefers: userId }, function(error, objRef) {
    if (!error) {
      'Data Found', objRef;
      callback(null, objRef);
    } else {
      callback(error, error);
    }
  }).select('-isFirstTx');
};

exports.startStage = function(index, callback) {
  truffle_connect.startCrowdsaleStage(index, function(error, msg) {
    if (!error) {
      ('Started');
      callback(null, 'Started Round');
    } else {
      callback(error, error);
    }
  });
};

exports.endStage = function(index, callback) {
  truffle_connect.endCrowdsaleStage(index, function(error, msg) {
    if (!error) {
      ('Stopped');
      callback(null, 'Stopped Round');
    } else {
      callback(error, error);
    }
  });
};

exports.icoPause = function(callback) {
  truffle_connect.pauseICO(function(error, msg) {
    if (!error) {
      ('ICO Paused');
      callback(null, 'ICO Paused');
    } else {
      callback(error, error);
    }
  });
};

exports.icoUnPause = function(callback) {
  truffle_connect.resumeICO(function(error, msg) {
    if (!error) {
      ('ICO Resumed');
      callback(null, 'ICO Resumed');
    } else {
      callback(error, error);
    }
  });
};

exports.changeParams = function(data, callback) {
  var crowdsaleStartTime = data.crowdsaleStartTime;
  var crowdsaleEndTime = data.crowdsaleEndTime;
  var CLCPerEther = data.CLCPerEther;
  var CLCPerBitcoin = data.CLCPerBitcoin;
  var CLCPerDollar = data.CLCPerDollar;
  truffle_connect.changeParameters(crowdsaleStartTime, crowdsaleEndTime, CLCPerEther, CLCPerBitcoin, CLCPerDollar, function(error, msg) {
    if (!error) {
      ('Parameters changed');
      callback(null, 'Parameters changed');
    } else {
      callback(error, error);
    }
  });
};

exports.getTransactions = function(callback) {
  function getTransactions() {
    return axios.get(
      constants.ETHERSCAN_API_URL + constants.CONTRACT_ADDRESS + '&startblock=0&endblock=99999999&apikey=' + constants.ETHERSCAN_API_KEY
    );
  }

  function getInternalTransactions() {
    return axios.get(
      constants.ETHERSCAN_API_URL + constants.CONTRACT_ADDRESS + '&startblock=0&endblock=99999999&apikey=' + constants.ETHERSCAN_API_KEY
    );
  }

  function getTokenTransfers() {
    return axios.get(
      constants.ETHERSCAN_API_URL + constants.CONTRACT_ADDRESS + '&startblock=0&endblock=999999999&apikey=' + constants.ETHERSCAN_API_KEY
    );
  }

  axios.all([getTransactions(), getInternalTransactions(), getTokenTransfers()]).then(
    axios.spread(function(transactions, internalTransactions, tokenTransfers) {
      // Both requests are now complete
      var txnlist = [];
      var intTxnlist = [];
      var tokenTxnlist = [];
      var txs = transactions.data.result;
      var inttxs = internalTransactions.data.result;
      var tokentr = tokenTransfers.data.result;
      async.parallel(
        [
          // function1
          function(function1Callback) {
            async.forEach(
              txs,
              function(tx, callbackS) {
                delete tx.input;
                txnlist.push(tx);
                callbackS();
              },
              function(err) {
                if (!err) {
                  function1Callback(null, txnlist);
                } else {
                  commonService.sendResponse(res, 500, 500, 'Some error occured: ' + err, err);
                }
              }
            );
          },
          function(function2Callback) {
            async.forEach(
              inttxs,
              function(inttx, callbackR) {
                delete inttx.input;
                intTxnlist.push(inttx);
                callbackR();
              },
              function(err) {
                if (!err) {
                  function2Callback(null, intTxnlist);
                } else {
                  commonService.sendResponse(res, 500, 500, 'Some error occured: ' + err, err);
                }
              }
            );
          },
          function(function3Callback) {
            async.forEach(
              tokentr,
              function(tokentx, callbackT) {
                delete tokentx.input;
                tokenTxnlist.push(tokentx);
                callbackT();
              },
              function(err) {
                if (!err) {
                  function3Callback(null, tokenTxnlist);
                } else {
                  commonService.sendResponse(res, 500, 500, 'Some error occured: ' + err, err);
                }
              }
            );
          }
        ],
        function(error, arrResult) {
          arrResult;
          var txnlist = arrResult[0];
          var intTxnlist = arrResult[1];
          var tokenTxnlist = arrResult[2];

          callback(null, txnlist, intTxnlist, tokenTxnlist);
        }
      );
    })
  );
};

exports.tokenExchange = function(data, callback) {
  var tokens = data.noOfTokens;
  var rateInEth;
  var rateInBTC;
  var rateInDollar;
  truffle_connect.getAllCrowdsaleDetails(function(err, round) {
    if (round) {
      round[4];
      truffle_connect.getCrowdsaleRoundPrices(function(err, prices) {
        if (prices) {
          'prices', prices;
          rateInEth = tokens / prices[0];
          rateInBTC = tokens / prices[1];
          rateInDollar = tokens / prices[2];
          ('doll', prices[2])('rate', rateInEth);
          callback(null, rateInEth, rateInBTC, rateInDollar);
        }
      });
    }
  });
};
exports.addAdminUser = async function(data, callback) {
  'adminuser', data;
  var passtring = randomstring.generate(6);
  var password = await genPassHash(passtring);
  AdminUser.findOne({ email: data.email }, function(error, user) {
    if (user) {
      callback('User with email ' + data.email + ' Already exists', null);
    } else {
      var newAdmin = new AdminUser({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: password,
        phone: data.phone,
        username: data.username,
        role: 'admin'
      });

      newAdmin.save(function(error, added) {
        if (!error) {
          var notidata = {
            email_temp: 'admin_created',
            title: 'Admin User Created',
            details: {
              firstname: data.firstname,
              lastname: data.lastname,
              email: data.email,
              password: passtring,
              username: data.username
            }
          };
          notification.sendAdminEmail(notidata, function(d) {
            d;
          });
          var added = added.toObject();
          delete added.verifyPasswordThree;
          delete added.verifyPasswordTwo;
          delete added.password;

          callback(null, added);
        } else {
          callback(error, error);
        }
      });
    }
  });
};

exports.listAdminUser = function(callback) {
  AdminUser.find({ role: 'admin' }, function(error, users) {
    if (!error) {
      callback(null, users);
    } else {
      callback(error, error);
    }
  }).select('-password -verifyPasswordTwo -verifyPasswordThree');
};
exports.approveAdminUser = function(data, callback) {
  AdminUser.update({ _id: data.id }, { $set: { isActive: true } }, function(error, approve) {
    if (!error) {
      callback(null, approve);
    } else {
      callback(error, error);
    }
  });
};
exports.revokeAdminUser = function(data, callback) {
  AdminUser.update({ _id: data.id }, { $set: { isActive: false } }, function(error, revoke) {
    if (!error) {
      callback(null, revoke);
    } else {
      callback(error, error);
    }
  });
};
exports.adminLogout = function(req, callback) {
  AdminUser.update({ _id: req.authenticationId._id }, { $set: { accessToken: null } }, function(error, logout) {
    if (!error) {
      callback(null, logout);
    } else {
      callback(error, error);
    }
  });
};
exports.setUpdateSecondPassword = async function(req, data, callback) {
  var password = await genPassHash(data.password);
  AdminUser.findOne({ _id: req.authenticationId._id }, function(error, user) {
    if (user) {
      AdminUser.update({ _id: req.authenticationId._id }, { $set: { passwordTwo: password } }, function(error, setPassword) {
        if (!error) {
          callback(null, setPassword);
        } else {
          callback(error, error);
        }
      });
    } else {
      callback('No admin user found!!', null);
    }
  });
};

exports.changePassword = async function(req, data, callback) {
  var password = await genPassHash(data.password);
  AdminUser.findOne({ _id: req.authenticationId._id }, function(error, user) {
    if (user) {
      AdminUser.update({ _id: req.authenticationId._id }, { $set: { password: password } }, function(error, setPassword) {
        if (!error) {
          callback(null, setPassword);
        } else {
          callback(error, error);
        }
      });
    } else {
      callback('No admin user found!!', null);
    }
  });
};

async function genPassHash(plainTextPassword) {
  const saltRounds = 10;
  const passHash = await bcrypt.hash(plainTextPassword, saltRounds);
  return passHash;
}
exports.verifySecondPassword = function(req, data, callback) {
  AdminUser.findOne({ _id: req.authenticationId._id }, function(error, result) {
    if (result) {
      if (bcrypt.compareSync(data.password, result.passwordTwo) === true) {
        var passwordThree = randomstring.generate(6);
        result.verifyPasswordTwo = true;
        result.passwordThree = passwordThree;
        result.save(function(error, saved) {
          if (saved) {
            var notidata = {
              email_temp: 'OTP_AdminUser',
              title: 'One Time Password For perform Admin Operations',
              details: {
                firstname: result.firstname,
                password: passwordThree,
                email: result.email
              }
            };
            notification.sendAdminEmail(notidata, function(d) {
              d;
            });
            callback(null, 'Password Match Successfully,Please enter third password sent on your email.');
          } else {
            callback(error, error);
          }
        });
      } else {
        callback('Invalid Password', null);
      }
    } else {
      callback('No admin user found!!', null);
    }
  });
};

exports.verifyThirdPassword = function(req, data, callback) {
  AdminUser.findOne({ _id: req.authenticationId._id }, function(error, result) {
    if (result && result.passwordThree == data.password) {
      result.passwordThree = null;
      result.verifyPasswordThree = true;
      result.save(function(error, saved) {
        if (!error) {
          callback(null, 'Password Match successfully!');
        } else {
          callback(error, error);
        }
      });
    } else {
      callback('Invalid Password', null);
    }
  });
};

async function generatePassword(password) {
  return password;
}
