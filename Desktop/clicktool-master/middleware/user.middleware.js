// Load user model.
const User = require('../models/Member');
const AccessToken = require('../models/AccessToken');
const AdminUser = require('../models/AdminUser');
const Admin = require('../models/Admin');
const Wallet = require('../models/wallet');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var constants = require('../modules/constants');
var jwt = require('jsonwebtoken');
var Web3 = require('web3');
var constants = require('../modules/constants');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const ethereumTx = require('ethereumjs-tx');
const ethereumWallet = require('ethereumjs-wallet');
//const bip39 = require('bip39');
// A middleware to check if posted signup data is valid or not.
exports.validateSignupData = async function(req, res, next) {
  await User.findOne({ email: req.body.email }, function(err, user) {
    // Handle internal server error.
    if (err) {
      return res.status(500).json({
        status: 500,
        message: 'Failed to signup. Internal server error.'
      });
    }

    // Send an error response if a user with this email already exists.
    if (user) {
      return res.status(400).json({
        status: 400,
        message: 'Failed to signup. User with email ' + req.body.email + ' already exists.'
      });
    } else {
      // All ok. Move forward.
      next();
    }
  });
};
// A middleware to check if posted signin data is valid or not.
exports.validateSignInData = async function(req, res, next) {
  await User.findOne({ email: req.body.email }, function(err, user) {
    // Handle internal server error.
    if (err) {
      return res.status(500).json({
        status: 500,
        message: 'Failed to signup. Internal server error.'
      });
    }
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "User doesn't exist"
      });
    }
    // Send an error response if a user with this email already exists.
    if (user) {
      var obj = {};
      if (user.emailVerified == true) {
        if (user.isActive == true) {
          if (bcrypt.compareSync(req.body.password, user.password) === true) {
            var sessData = req.session;
            obj.id = user.id;
            obj.email = user.email;
            obj.name = user.name;
            obj.emailVerified = user.emailVerified;
            obj.isActive = user.isActive;
            sessData.userLogin = obj;
            obj.error = 0;
            obj.msg = 'Login Successfully';
          } else {
            obj.error = 1;
            obj.msg = 'Invalid Password';
          }
        } else {
          obj.error = 1;
          obj.msg = 'User in not activated';
        }
      } else {
        obj.error = 1;
        obj.msg = 'Email not verified';
      }

      if (obj.error == 1) {
        return res.status(201).json({
          status: 201,
          message: obj.msg,
          error: 1
        });
      } else {
        return res.status(200).json({
          status: 200,
          message: obj.msg,
          error: 0
        });
      }
    } else {
      // All ok. Move forward.
      next();
    }
  });
};

exports.authenticate = async function(req, res, next) {
  if (req.session.userLogin) {
    await User.findOne({ _id: req.session.userLogin.userId }, function(err, user) {
      if (user) {
        req.session.userLogin.firstname = user.firstname;
        if (user.profilePicture) {
          req.session.userLogin.user.profilePicture = constants.ACCESSURL + 'uploads/profile_picture/' + user.profilePicture;
        } else {
          req.session.userLogin.user.profilePicture = '';
        }
      }
    });
    req.authenticationId = req.session.userLogin;
    next();
  } else {
    res.redirect('/');
  }
};
exports.checkMnemonicSession = async function(req, res, next) {
  if (req.session.userLogin.user.mnemonicGenerated == 'false') {
    res.redirect('/users/generate-recovery-phrase');
  } else if (!req.session.mnemonic) {
    res.redirect('/users/get-mnemonic-phrase');
  } else {
    next();
  }
};
exports.authenticateApi = async function(req, res, next) {
  if (req.query) {
    req.query.access_token;
    await AccessToken.findOne({ _id: req.query.access_token }, function(err, user) {
      if (user) {
        req.authenticationId = user;
        next();
      } else {
        return res.status(405).json({
          statusCode: 405,
          message: 'Invalid Access Token'
        });
      }
    });
  } else {
    return res.status(405).json({
      statusCode: 405,
      message: 'Authentication Failed'
    });
  }
};
exports.authenticateAdminApi = async function(req, res, next) {
  if (req.query) {
    req.query;
    var access_token = req.query.access_token;
    AdminUser.findOne({ accessToken: access_token }, function(err, adminFound) {
      if (adminFound && adminFound.isActive == true) {
        adminFound;
        req.authenticationId = adminFound;
        next();
      } else {
        return res.status(405).json({
          statusCode: 405,
          message: 'Failed to authenticate token.'
        });
      }
    });
  } else {
    return res.status(405).json({
      statusCode: 405,
      message: 'Failed to authenticate token.'
    });
  }
};

//exports.authenticateAdminApi = async function (req, res, next) {
//    if (req.query) {
//        (req.query);
//        var access_token = req.query.access_token;
//        AdminUser.findOne({email:"chris.kendricks07@gmail.com"}, function(err,adminFound){
//            if (adminFound && adminFound.accessToken == access_token) {
//                (adminFound);
//                next();
//            }
//            else {
//                return res.status(405).json({
//                    statusCode: 405,
//                    message: 'Failed to authenticate token.'});
//            }
//        })
//
//
//    } else {
//        return res.status(405)
//                .json({
//                    statusCode: 405,
//                    message: "Failed to authenticate token."
//                });
//    }
//};
exports.authenticateSupreAdmin = async function(req, res, next) {
  if (req.query) {
    req.query;
    var access_token = req.query.access_token;
    AdminUser.findOne({ accessToken: access_token }, function(err, adminFound) {
      adminFound;
      if (adminFound && adminFound.role == 'superadmin') {
        adminFound;
        next();
      } else {
        return res.status(405).json({
          statusCode: 405,
          message: 'Failed to authenticate token.'
        });
      }
    });
  } else {
    return res.status(405).json({
      statusCode: 405,
      message: 'Failed to authenticate token.'
    });
  }
};
exports.authenticateAdmin2FA = function(req, res, next) {
  if (req.query) {
    req.query;
    var access_token = req.query.access_token;
    AdminUser.findOne({ accessToken: access_token }, function(err, adminFound) {
      adminFound;
      if (adminFound && adminFound.role == 'superadmin') {
        adminFound;
        next();
      } else if (adminFound && adminFound.role == 'admin' && adminFound.verifyPasswordTwo == true && adminFound.verifyPasswordThree == true) {
        adminFound.verifyPasswordTwo = false;
        adminFound.verifyPasswordThree = false;
        adminFound.save(function(error, saved) {
          if (!error) {
            next();
          } else {
            return res.status(405).json({
              statusCode: 405,
              message: 'Failed to authenticate token.'
            });
          }
        });
      } else if (adminFound && adminFound.role == 'admin' && (adminFound.verifyPasswordTwo == false || adminFound.verifyPasswordThree == false)) {
        return res.status(405).json({
          statusCode: 405,
          message: 'Failed to authenticate admin User please verify 2FA with 2nd password and 3rd password.'
        });
      } else {
        return res.status(405).json({
          statusCode: 405,
          message: 'Failed to authenticate token.'
        });
      }
    });
  } else {
    return res.status(405).json({
      statusCode: 405,
      message: 'Failed to authenticate token.'
    });
  }
};
exports.isLogin = async function(req, res, next) {
  if (req.token) {
    req.token;
  }
  if (req.session.userLogin) {
    res.redirect('/users/dashboard');
  } else {
    next();
  }
};
exports.userSignout = async function(req, res, next) {
  if (req.session.userLogin) {
    req.session.destroy();
    res.redirect('/');
  } else {
    req.session.destroy();
    res.redirect('/');
  }
};
exports.getPrivateKey = async function(req, res, next) {
  // req.authenticationId = {
  //   userId : "5e2191bfece199238b44d36a"
  // }
  let wallet_index;
  let wallet_address = req.body.wallet_address.toLowerCase();
  const wallet = await Wallet.findOne({ walletAddress: wallet_address, memberId: req.authenticationId.userId });
  if (wallet) {
    wallet_index = wallet.indexOfWallet;
  } else return res.send({ status: 400, message: 'Wallet Not Found' });
  var mnemonic = req.body.mnemonic;
  var web3 = new Web3(constants.INFURA_ENDPOINT + constants.INFURA_KEY);
  var seed = bip39.mnemonicToSeed(mnemonic); //creates seed buffer
  var root = hdkey.fromMasterSeed(seed);
  var masterPrivateKey = root.privateKey.toString('hex');
  var addrNode = root.derive("m/44'/60'/0'/0/" + wallet_index); //line 1

  var pubKey = ethUtil.privateToPublic(addrNode._privateKey);
  var addr = ethUtil.publicToAddress(pubKey).toString('hex');
  var address = ethUtil.toChecksumAddress(addr);
  if (address.toLowerCase() != req.body.wallet_address.toLowerCase()) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Wallet Address Corrupted. Please try with diffrent wallet address'
    });
  }

  console.log('11111111111111111111...................', req.body, req.body.mnemonic);
  console.log('********************************************');
  console.log('22222222222222222222...................', wallet_index);
  console.log('********************************************');
  console.log('333333333333333333333...................', address);
  console.log('********************************************');
  console.log('444444444444444444444444...................', masterPrivateKey);
  console.log('********************************************');
  // Member.findOne({"_id":req.authenticationId.userId}, function(){

  // });
  req.privateKey = addrNode._privateKey;
  console.log('55555555555555555555...................', req.privateKey);
  console.log('********************************************');
  next();
  //need to check if the address belongs to user or not
  // Admin.findOne({email: "chris.kendricks07@gmail.com"}, function (err, adminFound) {
  //     if (adminFound && adminFound.accessToken == access_token) {
  //         (adminFound);
  //         next();
  //     } else {
  //         return res.status(405).json({
  //             statusCode: 405,
  //             message: 'Failed to authenticate token.'});
  //     }
  // })
};
exports.checkPhraseGenerated = function(req, res, next) {
  User.findOne({ _id: req.session.userLogin.userId }, function(error, users) {
    if (users) {
      if (users.mnemonicGenerated == true) {
        res.redirect('/');
      } else {
        next();
      }
    } else {
      res.redirect('/');
    }
  });
};
