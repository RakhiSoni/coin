// Access user service.
const adminService = require('../../services/admin.service');
const Admin = require('../../models/Admin');
const Wallet = require('../../models/wallet');
const User = require('../../models/Member');
const commonService = require('../../services/common.service');
const constants = require('../../modules/constants');
const truffle_connect = require('../../connection/app.js');
const frontConstant = require('../../modules/front_constant');
const async = require('async');
const { abi } = require('../../contractConfig/abi');
const Web3 = require('web3');
const provider = 'https://ropsten.infura.io/v3/5cfea0d474d94d178f030574a25eee02';
const web3 = new Web3(provider);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailer = require('../../modules/mailer');
const http = require('http');
const fs = require('fs');
const path = require('path');

exports.getTokenBalance = function(req, res, next) {
  adminService.getTokenBal(function(error, objInitialSupply, objTokensSold, objTokensRemaining) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Token Balance', {
        totalTokens: objInitialSupply,
        totalTokensSold: objTokensSold,
        totalTokensInHand: objTokensRemaining
      });
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.getAccessToken = function(req, res, next) {
  adminService.getAccessTok(req.body, function(error, objToken) {
    if (objToken.error == 1) {
      'objt', objToken;
      commonService.sendResponse(res, 401, 401, objToken.message);
    } else if (error) {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + err, err);
    } else {
      commonService.sendResponse(res, 200, 200, objToken.message, objToken.token);
    }
  });
};

exports.getDashboard1 = function(req, res, next) {
  var rounds = [0, 1, 2, 3, 4];
  var allRounds = {};
  var presale = [];
  var round1 = [];
  var round2 = [];
  var round3 = [];
  var round4 = [];
  var prices = {};
  //moment.duration(1532058000-1532055600).asDays();
  // var end = moment(1532214000);
  // var now = moment(1532058000);
  // var diff = moment.duration(end.diff(now));
  // (diff.asSeconds());
  // (diff.asMinutes());
  // (diff.asHours());
  // (diff.asDays());
  async.forEach(
    rounds,
    function(roundNum, callback) {
      adminService.getCrowdsaleDashboard(roundNum, function(error, objDashboard) {
        allRounds[roundNum] = objDashboard;
        callback();
      });
    },
    function(err) {
      if (!err) {
        truffle_connect.getAllCrowdsaleDetails(function(
          error,
          startTime,
          endEime,
          tokenSold,
          ethRaised,
          dollarsRaised,
          totalTokens,
          tokensRem,
          stage,
          clcperether,
          clcperbitcoin,
          clcperdollar
        ) {
          if (!error) {
            'allRounds', allRounds;
            commonService.sendResponse(res, 200, 200, 'Crowdsale Dashboard', {
              crowdsaleStartTime: startTime,
              crowdsaleEndTime: endEime,
              crowdSaleTotalTokensSold: tokenSold,
              crowdSaleTotalEthRaised: ethRaised,
              raisedAmtInDollars: dollarsRaised,
              crowdSaleTotalTokens: totalTokens,
              crowdSaleTokensInHand: tokensRem,
              ongoingStage: stage,
              CLCPerEther: clcperether,
              CLCPerBitcoin: clcperbitcoin,
              CLCPerDollar: clcperdollar,
              allRounds: allRounds
            });
          } else {
            commonService.sendResponse(res, 500, 500, 'Some error occured: ' + err, err);
          }
        });
      } else {
        commonService.sendResponse(res, 500, 500, 'Some error occured: ' + err, err);
      }
    }
  );
};

exports.getUserList = function(req, res, next) {
  adminService.getUsers(function(error, objUser) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'List Of Users', objUser);
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.getWalletList = function(req, res, next) {
  adminService.getWallets(function(error, objWallet) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'List Of Wallets', objWallet);
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.transferTokensToAllUsers = function(req, res, next) {
  adminService.transferTokens(function(error, tokenTransfer) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'All Tokens are transferred to Users.');
    } else {
      'tokenTransfer1', tokenTransfer;
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
    // return res.status(200)
    //         .json({
    //             "statusCode": 200,
    //             "message": "All Tokens are transferred to Users."
    //         });
  });
};

exports.executeAirDrop = function(req, res, next) {
  var data = req.body;
  ('Came here');
  'dataaa', data;
  var add = data.addresses.split(',');
  var tok = data.tokens.split(',');
  ('ddddddd', add)('fffdd', tok);
  adminService.airdropExecute(add, tok, function(error, objAirdrop) {
    if (!error) {
      ('Airdrop');
      commonService.sendResponse(res, 200, 200, 'Airdrop has been executed');
    } else if (error == 'exceed') {
      ('Failed');
      commonService.sendResponse(res, 200, 200, 'Tokens exceed the airdrop supply');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};

exports.userTransactions = function(req, res, next) {
  var data = req.body;

  adminService.userTxns(data, function(error, objTxs) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'User transactions', objTxs);
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};

exports.userReferrals = function(req, res, next) {
  var data = req.body;

  adminService.userReferral(data, function(error, objRef) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'User Referrals', objRef);
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};

exports.endCrowdsaleStage = function(req, res, next) {
  adminService.endStage(function(error, objMsg) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Current Round has been stopped');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.tokenExchangeRate = function(req, res, next) {
  var data = req.body;

  adminService.tokenExchange(data, function(error, objRateInEther, objRateInBTC, objRateInDollar) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Rate of tokens in Ether, Bitcoin and USD.', {
        rateInEther: objRateInEther,
        rateInBitcoin: objRateInBTC,
        rateInDollar: objRateInDollar
      });
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.pauseICO = function(req, res, next) {
  adminService.icoPause(function(error, objMsg) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'ICO has been paused.');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.resumeICO = function(req, res, next) {
  adminService.icoUnPause(function(error, objMsg) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'ICO has been resumed.');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.startCrowdsaleStage = function(req, res, next) {
  var data = req.body;
  var stage = req.body.stage;
  adminService.startStage(stage, function(error, objMsg) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Round ' + stage + ' has been started');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.listOfCrowdsaleStages = function(req, res, next) {
  var data = req.body;
  return res.status(200).json({
    statusCode: 200,
    message: 'List Of Crowdsale Stages.',
    data: {
      rounds: ['Presale', 'Round 1', 'Round 2', 'Round 3', 'Round 4']
    }
  });
};

exports.changeCrowdsaleParameters = function(req, res, next) {
  // return res.status(200)
  //         .json({
  //             "statusCode": 200,
  //             "message": "The Crowdsale Parameters have been changed.",

  //         });
  var data = req.body;

  adminService.changeParams(data, function(error, objMsg) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'The crowdsale parameters have been changed');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.getTransactionHistory = function(req, res, next) {
  var data = req.body;
  adminService.getTransactions(function(error, objTransactions, objInternal, objTokenTransfer) {
    var response = {
      transaction: objTransactions,
      internalTx: objInternal,
      tokenTransfer: objTokenTransfer
    };
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Transaction History', response);
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.addAdminUser = function(req, res, next) {
  adminService.addAdminUser(req.body, function(error, user) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Admin User Added', user);
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error);
    }
  });
};

exports.listAdminUser = function(req, res, next) {
  adminService.listAdminUser(function(error, users) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'List of Admin User', users);
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.approveAdminUser = function(req, res, next) {
  adminService.approveAdminUser(req.body, function(error, users) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Successfully grant access to user');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.revokeAdminUser = function(req, res, next) {
  adminService.revokeAdminUser(req.body, function(error, users) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Access revoke from User');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.adminLogout = function(req, res, next) {
  adminService.adminLogout(req, function(error, users) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Logout Successfully!!');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.setUpdateSecondPassword = function(req, res, next) {
  adminService.setUpdateSecondPassword(req, req.body, function(error, users) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Password Updated Successfully!!');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.changePassword1 = function(req, res, next) {
  adminService.changePassword(req, req.body, function(error, users) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Password Changed Successfully!!');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.verifySecondPassword = function(req, res, next) {
  adminService.verifySecondPassword(req, req.body, function(error, users) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Password Match Successfully!!');
    } else {
      commonService.sendResponse(res, 201, 201, error, error);
    }
  });
};

exports.verifyThirdPassword = function(req, res, next) {
  adminService.verifyThirdPassword(req, req.body, function(error, users) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Password Match Successfully!!');
    } else {
      commonService.sendResponse(res, 201, 201, error, error);
    }
  });
};

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

exports.login = async (req, res) => {
  // Req Params : username , password
  try {
    let data;
    const user = await Admin.findOne({ username: req.body.userName });
    if (!user) return commonService.sendResponse(res, 404, 404, 'No User Found', null);
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return commonService.sendResponse(res, 401, 401, 'Wrong Password. Please enter correct password', data);
    let obj = {};
    obj.userId = user._id;
    obj.email = user.email;
    obj.username = user.username;
    req.session.adminLogin = obj;
    return commonService.sendResponse(res, 200, 200, 'Logged in Successfully', req.session);
  } catch (err) {
    commonService.sendResponse(res, 500, 500, 'An Error Occured', null);
  }
};

exports.getDashboard = async (req, res) => {
  try {
    let renderParams = {
      layout: 'admin-main',
      title: 'admin-dashboard',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS);
    if (contract) {
      const currentRound = await contract.methods.currentStage().call();
      const rounds = [];
      rounds[0] = await contract.methods.rounds(0).call();
      rounds[1] = await contract.methods.rounds(1).call();
      rounds[2] = await contract.methods.rounds(2).call();
      const users = await User.find({});
      const pendingUsers = await User.find({ kyc: { isVerified: 1 } });
      const privateSale = await contract.methods.privateSaleCount().call();
      const totalTokensSold = await contract.methods.totalTokensSold().call();
      const softCap = await contract.methods.softCap().call();
      const weiCollection = await contract.methods.totalWeiRaised().call();
      const totalSupply = await contract.methods.totalSupply().call();
      for (let i = 0; i < 3; i++) {
        rounds[i].tokenSold = web3.utils.fromWei(rounds[i].tokenSold.toString(), 'ether');
        rounds[i].softCap = web3.utils.fromWei(rounds[i].softCap.toString(), 'ether');
        rounds[i].tokenSupply = web3.utils.fromWei(rounds[i].tokenSupply.toString(), 'ether');
      }
      let result = {
        activeRound: '',
        activeRoundName: '',
        activeRoundDate: '',
        activeRoundRate: '',
        todayRate: {},
        headline: '',
        futureDate: '',
        round1: rounds[0].name,
        round2: rounds[1].name,
        round3: rounds[2].name,
        rate1: rounds[0].rate / 100,
        rate2: rounds[1].rate / 100,
        rate3: rounds[2].rate / 100,
        dateRange1: `${new Date(rounds[0].startDate * 1000).toDateString()} - ${new Date(rounds[0].endDate * 1000).toDateString()}`,
        dateRange2: `${new Date(rounds[1].startDate * 1000).toDateString()} - ${new Date(rounds[1].endDate * 1000).toDateString()}`,
        dateRange3: `${new Date(rounds[2].startDate * 1000).toDateString()} - ${new Date(rounds[2].endDate * 1000).toDateString()}`,
        round1Details: rounds[0],
        round2Details: rounds[1],
        round3Details: rounds[2],
        totalUsers: users ? users.length : 0,
        totalKYCPendingRequest: pendingUsers ? pendingUsers.length : 0,
        privateSaleCount: privateSale ? privateSale / constants.TAC_DECIMALS : 0,
        totalTokensSold: totalTokensSold ? totalTokensSold / constants.TAC_DECIMALS : 0,
        softCap: softCap ? softCap / constants.TAC_DECIMALS : 0,
        hardCap: totalSupply ? totalSupply / constants.TAC_DECIMALS : 0,
        totalCollection: {
          ether: web3.utils.fromWei(weiCollection.toString(), 'ether'),
          bitcoin: 0,
          usd: 0
        }
      };
      if (currentRound == 0 || currentRound == 1 || currentRound == 2) {
        const currentRoundRateInCents = rounds[currentRound].rate;
        let ethToUsd = await commonService.getETHToUSD();
        const usdToEth = currentRoundRateInCents / (ethToUsd * 100);
        let btcToUsd = await commonService.getBTCToUSD();
        const usdToBtc = currentRoundRateInCents / (btcToUsd * 100);

        result.activeRound = parseInt(currentRound) + 1;
        result.activeRoundName = rounds[currentRound].name;
        result.activeRoundDate = `${new Date(rounds[currentRound].startDate * 1000).toDateString()} - ${new Date(
          rounds[currentRound].endDate * 1000
        ).toDateString()}`;
        result.activeRoundRate = rounds[currentRound].rate / 100;
        result.todayRate = {
          bitcoinRate: commonService.convertExponentialToDecimal(usdToBtc),
          etherRate: commonService.convertExponentialToDecimal(usdToEth),
          dollarRate: currentRoundRateInCents / 100
        };
        result.headline = `${rounds[currentRound].name} Ends In`;
        result.futureDate = new Date(rounds[currentRound].endDate * 1000);
        // res.send(result);
        renderParams.result = result;
        res.render('admin/dashboard', renderParams);
      } else if (currentRound == 4) {
        if (rounds[0].startDate < new Date().getTime / 1000) {
          result.headline = 'Presale Round 1 Starts In ';
          result.futureDate = new Date(rounds[0].startDate * 1000);
          // res.send(result);
          renderParams.result = result;
          res.render('admin/dashboard', renderParams);
        } else {
          result.headline = 'Sale Ended';
          // res.send(result);
          renderParams.result = result;
          res.render('admin/dashboard', renderParams);
        }
      } else {
        const now = Math.floor(new Date().getTime() / 1000);
        if (now > rounds[0].endDate() && now < rounds[1].startDate) {
          result.headline = `Presale Round 2 Starts In`;
          result.futureDate = new Date(rounds[1].startDate * 1000);
          // res.send(result);
          renderParams.result = result;
          res.render('admin/dashboard', renderParams);
        } else {
          result.headline = `Crowdsale Starts In`;
          // res.send(result);
          renderParams.result = result;
          res.render('admin/dashboard', renderParams);
        }
      }
    } else {
      // res.send("error...");
      res.render('admin/dashboard', renderParams);
    }
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // user: req.session.userLogin,
    };
    // res.send(err);
    res.render('error', renderParamsErr);
  }
};

exports.forgotPassword = async (req, res) => {
  const reqEmail = req.body.email;
  try {
    const admin = await Admin.findOne({ email: reqEmail });
    if (admin) {
      const resetPasswordToken = jwt.sign({ reqEmail }, constants.SECRET, { expiresIn: '1d' });
      admin.resetPasswordToken = resetPasswordToken;
      admin.isforgotPassword = true;
      const result = await admin.save();
      if (result) {
        let templateVariable = {
          templateURL: 'mailtemplate/admin-forgotpassword',
          token: resetPasswordToken,
          fullName: admin.username,
          FRONT_BASE_URL: constants.ACCESSURL
        };
        let mailParamsObject = {
          templateVariable: templateVariable,
          to: req.body.email,
          subject: 'Reset Password Link'
        };
        mailer.sendMail(mailParamsObject, function(err) {
          if (err) return commonService.sendResponse(res, 201, 201, 'Mail not sent.', null);
          else return commonService.sendResponse(res, 200, 200, 'Mail sent successfully.', null);
        });
      } else return commonService.sendResponse(res, 500, 500, 'Unable to connect to database. Please try again later.', null);
    } else return commonService.sendResponse(res, 404, 404, 'Email not found, please enter existing one', null);
  } catch (exception) {
    console.log('Error  occurred...', exception);
    commonService.sendResponse(res, 404, 404, 'Something went wrong.', null);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    if (req.body.token && req.body.token != undefined && req.body.password && req.body.password != undefined) {
      const token = jwt.verify(req.body.token, constants.SECRET);
      if (token) {
        const admin = await Admin.findOne({ email: token.reqEmail });
        if (admin) {
          let hash = bcrypt.hashSync(req.body.password, 10);
          admin.password = hash;
          const result = await admin.save();
          if (result) commonService.sendResponse(res, 200, 200, 'Password updated successfully.', null);
          else commonService.sendResponse(res, 500, 500, 'Something went wrong while connecting to database', null);
        } else commonService.sendResponse(res, 404, 404, 'Admin not Found', null);
      } else commonService.sendResponse(res, 401, 401, 'Token  not valid', null);
    } else commonService.sendResponse(res, 404, 404, 'Request Parameters Missing', null);
  } catch (err) {
    commonService.sendResponse(res, 404, 404, 'Something went wrong.', null);
  }
};

exports.reset_Password = async function(req, res, next) {
  let token = req.params.token;
  try {
    const checkToken = await Admin.findOne({ resetPasswordToken: token });
    if (checkToken != null && checkToken.isforgotPassword == true) {
      let renderParams = {
        layout: 'admin-login',
        title: 'admin-Login',
        frontConstant: frontConstant,
        constants: constants,
        token: token
      };
      res.render('admin/reset_password', renderParams);
    } else {
      let renderParamsErr = {
        layout: 'blank',
        title: 'error',
        constants: constants
      };
      res.render('error', renderParamsErr);
    }
  } catch (exception) {
    // Return an error response with code and message.
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      constants: constants
      // admin: req.session.adminLogin
    };
    res.render('error', renderParamsErr);
  }
};

exports.getUsers = async (req, res) => {
  try {
    let renderParams = {
      layout: 'admin-main',
      title: 'admin-users',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    const users = await User.find({}).sort('-createdAt');
    if (users && users.length > 0) {
      users.map(item => {
        item.profilePic = item.profilePicture;
          item.name = item.firstname + ' ' + item.lastname;
          item.registeredDate  = new Date(item.createdAt).toDateString();
          item.kycStatus =item.kyc.isVerified ? item.kyc.isVerified : 0;
          item.passwordConfirm = '';
          item.otp = '';
          item.fcmToken = '';
      });
      renderParams.result = users;
      res.render('admin/users', renderParams);
      // return commonService.sendResponse(res, 200, 200, 'Users displayed Successfully', data);
    } else {
      renderParams.result = data;
      res.render('admin/users', renderParams);
    }
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // user: req.session.userLogin,
    };
    res.render('error', renderParamsErr);
  }
};

exports.getUserById = async (req, res) => {
  try {
    let renderParams = {
      layout: 'admin-main',
      title: 'admin-users',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    if (req.query.userId && req.query.userId != undefined) {
      const user = await User.findOne({ _id: req.query.userId });
      if (user) {
        user['wallets'] = '';
        user.password = '';
        user.secretAccessKey = '';
        user.passwordConfirm = '';
        user.fcmToken = '';
        user.otp = '';
        user.registeredDate = new Date(user.createdAt).toDateString();
        renderParams.result = user;
        res.render('admin/user-details', renderParams);
      } else res.render('admin/user-details', renderParams);
    } else res.render('admin/user-details', renderParams);
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // user: req.session.userLogin,
    };
    res.render('error', renderParamsErr);
  }
};

exports.createUser = async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser) return commonService.sendResponse(res, 201, 201, 'User with this email already exists. ', null);
    const passwordCreate = randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    const email = req.body.email;
    const token = await jwt.sign({ email }, constants.SECRET, { expiresIn: '1d' });

    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: email,
      phone: req.body.phone,
      countryCode: req.body.countryCode,
      passwordConfirm: passwordCreate,
      referralCode: randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      kyc: {
        isVerified: 2
      },
      verificationToken: token
    });

    var templateVariable = {
      templateURL: 'mailtemplate/registration',
      fullName: req.body.fname + ' ' + req.body.lname + '' + 'Password : ' + passwordCreate,
      token: token,
      FRONT_BASE_URL: constants.ACCESSURL
    };
    var mailParamsObject = {
      templateVariable: templateVariable,
      to: req.body.email,
      subject: 'Registration Successful.'
    };

    mailer.sendMail(mailParamsObject, async function(err) {
      if (err) return res.status(201).json({ status: 201, data: err, message: 'Mail sending failed.', error: 1 });
      else {
        const saveduser = await newUser.save();
        if (saveduser) {
          saveduser['wallets'] = '';
          saveduser.password = '';
          saveduser.secretAccessKey = '';
          saveduser.passwordConfirm = '';
          saveduser.fcmToken = '';
          saveduser.otp = '';
          return res.status(200).json({ status: 200, data: saveduser, message: 'User created successfully.Email sent for verification', error: 0 });
        } else return res.status(201).json({ status: 201, data: saveduser, message: 'Error while saving to database', error: 1 });
      }
    });
  } catch (exception) {
    res.status(500).json({ status: 500, message: 'User creation failed. Something went wrong.', error: 1 });
  }
};

exports.getKYCRequest = async (req, res) => {
  try {
    let renderParams = {
      layout: 'admin-main',
      title: 'admin-kyc-request',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    let data = {
      pending: [],
      approved: [],
      declined: []
    };
    const users = await User.find({}, 'firstname lastname email kyc createdAt profilePicture');
    if (users && users.length > 0) {
      users.map(item => {
        item.name = item.firstname + ' ' + item.lastname;
        (item.registeredDate = new Date(item.createdAt).toDateString()), (item.kycStatus = item.kyc.isVerified);
        item.profilePic = item.profilePicture;
        if (item.kyc.isVerified == 1) {
          data.pending.push(item);
        } else if (item.kyc.isVerified == 2) {
          data.approved.push(item);
        } else if (item.kyc.isVerified == 3) {
          item.failReason = item.kyc.failReason;
          data.declined.push(item);
        }
        // return commonService.sendResponse(res, 200, 200, 'KYC Rquest displayed successfully', data);
      });
      renderParams.result = data;
      res.render('admin/kyc-request', renderParams);
    } else {
      res.render('admin/kyc-request', renderParams);
    }
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // user: req.session.userLogin,
    };
    res.render('error', renderParamsErr);
  }
};

exports.getKYCById = async (req, res) => {
  try {
    let renderParams = {
      layout: 'admin-main',
      title: 'admin-kyc-request',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    if (req.query.userId && req.query.userId != undefined) {
      const user = await User.findOne({ _id: req.query.userId });
      if (user) {
        user['wallets'] = '';
        user.password = '';
        user.secretAccessKey = '';
        user.passwordConfirm = '';
        user.fcmToken = '';
        user.otp = '';
        // user.kyc.time_unix = new Date(user.kyc.time_unix).toDateString();
        renderParams.result = user;
        res.render('admin/kyc-details', renderParams);
      } else res.render('admin/kyc-details', renderParams);
    } else res.render('admin/kyc-details', renderParams);
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // user: req.session.userLogin,
    };
    res.render('error', renderParamsErr);
  }
};

exports.getKYCByIdView = async (req, res) => {
  try {
    let renderParams = {
      layout: 'admin-main',
      title: 'admin-kyc-request',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    if (req.query.userId && req.query.userId != undefined) {
      const user = await User.findOne({ _id: req.query.userId });
      if (user) {
        user['wallets'] = '';
        user.password = '';
        user.secretAccessKey = '';
        user.passwordConfirm = '';
        user.fcmToken = '';
        user.otp = '';
        renderParams.result = user;
        res.render('admin/kyc-details-view', renderParams);
      } else res.render('admin/kyc-details-view', renderParams);
    } else res.render('admin/kyc-details-view', renderParams);
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // user: req.session.userLogin,
    };
    res.render('error', renderParamsErr);
  }
};

exports.updateKYCStatus = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    if (user) {
      if (user.kyc && user.kyc.isVerified == 1) {
        if (req.body.status == 2) {
          user.kyc.isVerified = req.body.status;
          var templateVariable = {
            templateURL: 'mailtemplate/approveKYC',
            name: user.firstname + ' ' + user.lastname
          };
          var mailParamsObject = {
            templateVariable: templateVariable,
            to: user.email,
            subject: 'Your KYC Status has been updated by Admin'
          };
          mailer.sendMail(mailParamsObject, function(err) {
            if (err) console.log('Mail not sent in approve KYC');
          });
          const result = await user.save();
          if (result) return commonService.sendResponse(res, 200, 200, 'KYC Status updated successfully', null);
          else return commonService.sendResponse(res, 500, 500, 'Error while connecting to database', null);
        } else if (req.body.status == 3) {
          user.kyc.isVerified = req.body.status;
          user.kyc.failReason = req.body.reason ? req.body.reason : '';

          let templateVariable = {
            templateURL: 'mailtemplate/rejectKYC',
            name: user.firstname + ' ' + user.lastname,
            reason: req.body.reason
          };
          let mailParamsObject = {
            templateVariable: templateVariable,
            to: user.email,
            subject: 'Your KYC Status has been updated by Admin'
          };
          mailer.sendMail(mailParamsObject, function(err) {
            if (err) console.log('Mail not sent in Reject KYC');
          });

          const result = await user.save();
          if (result) return commonService.sendResponse(res, 200, 200, 'KYC Status updated successfully', null);
          else return commonService.sendResponse(res, 500, 500, 'Error while connecting to database', null);
        } else return commonService.sendResponse(res, 401, 401, 'KYC Status wrong', null);
      } else return commonService.sendResponse(res, 404, 404, 'KYC Not submitted by user', null);
    } else return commonService.sendResponse(res, 404, 404, 'No user found', null);
  } catch (err) {
    commonService.sendResponse(res, 500, 500, 'Something went wrong.', null);
  }
};

exports.generalTransferTokens = async (req, res) => {
  try {
    if (req.body.address && req.body.address != undefined && req.body.tokens && req.body.tokens != undefined && req.body.tokens > 0) {
      const tokenBits = await web3.utils.toWei(req.body.tokens.toString(), 'ether');
      const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS, { gasLimit: 3000000 });
      if (contract) {
        const contractFunction = contract.methods.transferAnyERC20Token(req.body.address, tokenBits); // Here you can call your contract functions
        //const contractFunction = contract.methods.transferAnyERC20Token(req.body.address, tokenBits, true, false); // Here you can call your contract functions

        if (contractFunction && contractFunction != undefined) {
          const functionAbi = contractFunction.encodeABI();
          commonService.sendSignedTransactionAdmin(functionAbi, function(error, txHash) {
            if (!error) return commonService.sendResponse(res, 200, 200, 'Tokens Transfer Request Sent Successfully', { txhash: txHash });
            else {
              return commonService.sendResponse(res, 500, 500, 'Some Error Occurred', null);
            }
          });
        } else return commonService.sendResponse(res, 500, 500, 'Some Error Occurred during contract function call', null);
      } else commonService.sendResponse(res, 500, 500, 'Some Error Occurred  during contract execution', null);
    } else return commonService.sendResponse(res, 404, 404, 'Missing Parameters', null);
  } catch (err) {
    commonService.sendResponse(res, 404, 404, 'Something went wrong.', null);
  }
};

exports.transferTokens = async (req, res) => {
  try {
    const tokens = req.body.tokens;
    if (req.body.user && req.body.user != undefined && tokens && tokens != undefined && tokens > 0) {
      const user = await User.findOne({ email: req.body.user });
      if (user) {
        const wallet = await Wallet.findOne({ memberId: user._id, defaultAddress: true });
        if (wallet) {
          const tokenBits = await web3.utils.toWei(tokens.toString(), 'ether');
          const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS, {
            gasLimit: 3000000
          });
          if (contract) {
            const contractFunction = contract.methods.transferAnyERC20Token(wallet.walletAddress, tokenBits); // Here you can call your contract functions
            //const contractFunction = contract.methods.transferAnyERC20Token(wallet.walletAddress, tokenBits, true, false); // Here you can call your contract functions

            if (contractFunction && contractFunction != undefined) {
              const functionAbi = contractFunction.encodeABI();
              commonService.sendSignedTransactionAdmin(functionAbi, function(error, txHash) {
                if (!error) return commonService.sendResponse(res, 200, 200, 'Tokens Transfer Request Sent Successfully', { txhash: txHash });
                else {
                  return commonService.sendResponse(res, 500, 500, 'Some Error Occurred', null);
                }
              });
            } else return commonService.sendResponse(res, 500, 500, 'Some Error Occurred during contract function call', null);
          } else commonService.sendResponse(res, 500, 500, 'Some Error Occurred  during contract execution', null);
        } else return commonService.sendResponse(res, 404, 404, 'Wallet not found', null);
      } else return commonService.sendResponse(res, 404, 404, 'User not found', null);
    } else return commonService.sendResponse(res, 404, 404, 'Missing Parameters', null);
  } catch (err) {
    commonService.sendResponse(res, 500, 500, 'Something went wrong.', null);
  }
};

const getToUser = async walletAddress => {
  const wallet = await Wallet.findOne({ walletAddress: walletAddress });
  if (wallet) {
    const user = await User.findOne({ _id: wallet.memberId });
    if (user) return user.firstname + ' ' + user.lastname;
    else return 'null';
  } else {
    const admin = await Admin.findOne({ publicEtherWalletAddress: walletAddress });
    if (admin) return admin.username;
    else return 'null';
  }
};

exports.getHistory = async (req, res) => {
  try {
    let renderParams = {
      layout: 'admin-main',
      title: 'admin-transactions',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    const url = `${constants.ETHERSCAN_URL}?module=account&action=tokentx&contractaddress=${constants.ABUNDANCE_CONTRACT_ADDRESS}&page=1&offset=100&sort=asc&apikey=${constants.ETHERSCAN_API_KEY}`;
    const tx = await commonService.getEtherscanTransactions(url);
    if (tx != 0 && tx.length > 0) {
      const arrayPromise = tx.map(async item => {
        item.toUser = await getToUser(item.to);
        item.fromUser = await getToUser(item.from);
        item.timeStamp = new Date(item.timeStamp * 1000).toDateString();
        item.txURL = `https://ropsten.etherscan.io/tx/${item.hash}`;
        item.value = (item.value / 10 ** 18).toFixed(8);
        item.currency = 'ETH';
      });
      const result = await Promise.all(arrayPromise);
      if (result) {
        renderParams.result = tx;
        res.render('admin/transactions', renderParams);
        // commonService.sendResponse(res, 200, 200, 'Successfull', tx);
      } else {
        res.render('admin/transactions', renderParams);
      }
    } else {
      res.render('admin/transactions', renderParams);
    }
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // user: req.session.userLogin,
    };
    res.render('error', renderParamsErr);
  }
};

exports.getEtherWallet = async (req, res) => {
  // req.authenticationId = {
  //   userId: '5e15b62e7be0c71958092be3'
  // };
  try {
    let renderParams = {
      layout: 'admin-main',
      title: 'admin-wallets',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    const admin = await Admin.findOne({ _id: req.authenticationId.userId });
    if (admin && admin.publicEtherWalletAddress) {
      const balance = await web3.eth.getBalance(admin.publicEtherWalletAddress);
      let data = {
        _id: admin._id,
        etherWallet: {
          walletaddress: admin.publicEtherWalletAddress,
          walletbalance: web3.utils.fromWei(balance.toString(), 'ether'),
          transactions: ''
        },
        bitcoinWallet: {},
        usdWallet: {}
      };
      const url = `${constants.ETHERSCAN_URL}?module=account&action=txlist&address=${admin.publicEtherWalletAddress}&page=1&offset=100&sort=asc&apikey=${constants.ETHERSCAN_API_KEY}`;
      const tx = await commonService.getEtherscanTransactions(url);
      if (tx != 0 && tx.length > 0) {
        const arrayPromise = tx.map(item => {
          if (!item.to) item.to = item.contractAddress;
          item.input = '';
          item.value = web3.utils.fromWei(item.value.toString(), 'ether');
          item.timeStamp = new Date(item.timeStamp * 1000).toDateString();
          item.txURL = `https://ropsten.etherscan.io/tx/${item.hash}`;
        });
        const result = await Promise.all(arrayPromise);
        if (result) {
          data.etherWallet.transactions = tx;
          renderParams.result = data;
          res.render('admin/wallets', renderParams);
          // return commonService.sendResponse(res, 200, 200, 'Wallet Details Displayed successfully', data);
        } else {
          res.render('admin/wallets', renderParams);
          // return commonService.sendResponse(res, 500, 500, 'Something went wrong', null);
        }
      } else {
        res.render('admin/wallets', renderParams);
        //  return commonService.sendResponse(res, 200, 200, 'Wallet Details Displayed successfully', data);
      }
    } else {
      res.render('admin/wallets', renderParams);
      // return commonService.sendResponse(res, 404, 404, 'User or wallet not found', null);
    }
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // user: req.session.userLogin,
    };
    res.render('error', renderParamsErr);
  }
};

exports.getBitcoinWallet = async (req, res) => {
  try {
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    res.render('error', renderParamsErr);
  }
};

exports.getUSDWallet = async (req, res) => {
  try {
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    res.render('error', renderParamsErr);
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.session.userLogin) {
      req.session.destroy();
      res.redirect('/admin');
    } else {
      req.session.destroy();
      res.redirect('/admin');
    }
  } catch (err) {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // admin: req.session.adminLogin
    };
    res.render('error', renderParamsErr);
  }
};

exports.updatepassword = async (req, res) => {
  const password = req.body.password;
  const newPassword = req.body.newPassword;
  if (password && password != undefined && newPassword && newPassword != undefined) {
    const user = await Admin.findOne({ _id: req.authenticationId.userId });
    if (!user) {
      return commonService.sendResponse(res, 404, 404, "sorry user doesn't exist", null);
    }
    const result = await bcrypt.compare(password, user.password);
    if (result == false) {
      return commonService.sendResponse(res, 401, 401, "sorry current password doesn't match", null);
    }
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newPassword, salt);
    const result1 = await user.save();
    if (result1) return commonService.sendResponse(res, 200, 200, 'New  Password set successfully. Please login with new password', null);
    else return commonService.sendResponse(res, 500, 500, 'Some error occured while connecting to database', null);
  } else commonService.sendResponse(res, 404, 404, 'Request Params Missing', null);
};

exports.logOut = async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    res.redirect('/auth/login');
  }
};

exports.getProfile = async (req, res) => {
  const user = await Admin.findOne({ _id: req.authenticationId.userId }, 'username email profilePicture');
  if (user) {
    let renderParams = {
      layout: 'admin-main',
      title: 'admin-profile',
      frontConstant: frontConstant,
      constants: constants,
      admin: req.session.adminLogin
    };
    renderParams.result = user;
    res.render('admin/profile', renderParams);
    // return commonService.sendResponse(res, 200, 200, 'Admin Profile displayed Successfully', user);
  } else {
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      frontConstant: frontConstant,
      constants: constants
      // admin: req.session.adminLogin
    };
    res.render('error', renderParamsErr);
  }
};

exports.updateProfile = async (req, res) => {
  if (req.file) {
    var ext = path.extname(req.file.path);
    if (ext == '.jpeg' || ext == '.png' || ext == '.jpg') {
    } else return commonService.sendResponse(res, 404, 404, 'Only send required file format', null);
  }
  const user = await Admin.findOne({ _id: req.authenticationId.userId });
  if (user) {
    user.profilePicture = req.file ? req.file.filename : user.profilePicture;
    user.username = req.body.username ? req.body.username : user.username;
    user.email = req.body.email ? req.body.email : user.email;
    if (req.file) {
      req.session.adminLogin.profilePicture = constants.ACCESSURL + 'uploads/profile_picture/' + req.file.filename;
    }
    req.session.adminLogin.username = req.body.username ? req.body.username : user.username;
    req.session.adminLogin.email = req.body.email ? req.body.email : user.email;

    const result = await user.save();
    if (result) return commonService.sendResponse(res, 200, 200, 'Profile updated Successfully', null);
    else return commonService.sendResponse(res, 500, 500, 'Unable to connect to  database.', null);
  } else return commonService.sendResponse(res, 404, 404, 'User not found', null);
};

exports.startNextRound = async (req, res) => {
  try {
    const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS, { gasLimit: 3000000 });
    if (contract) {
      const currentRound = await contract.methods.currentStage().call();
      if (currentRound >= 0 && currentRound < 2) {
        const contractFunction = contract.methods.setCrowdsaleStage(); // Here you can call your contract functions
        if (contractFunction && contractFunction != undefined) {
          const functionAbi = contractFunction.encodeABI();
          commonService.sendSignedTransactionAdmin(functionAbi, function(error, txHash) {
            if (!error) return commonService.sendResponse(res, 200, 200, 'Next Round started Successfully', { txhash: txHash });
            else return commonService.sendResponse(res, 500, 500, 'Some Error Occurred', null);
          });
        } else return commonService.sendResponse(res, 500, 500, 'Some Error Occurred during contract function call', null);
      } else commonService.sendResponse(res, 500, 500, 'Some Error Occurred  during contract execution', null);
    } else
      commonService.sendResponse(
        res,
        500,
        500,
        'Error. Cant update in below conditions. 1.Sale has not started || 2. Already in crowdsale || 3. Sale Ended',
        null
      );
  } catch (err) {
    console.log('Error occurred in Start Next Round API..', err);
    commonService.sendResponse(res, 404, 404, 'Something went wrong.', null);
  }
};

exports.updateSoftCap = async (req, res) => {
  try {
    let softCap = req.body.softCap;
    if (softCap && softCap != undefined) {
      if (softCap > 0) {
        const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS, { gasLimit: 3000000 });
        if (contract) {
          const totalSupply = await contract.methods.totalSupply().call();
          const decimalTotalSupply = web3.utils.fromWei(totalSupply.toString(), 'ether');
          if (parseFloat(softCap) < parseFloat(decimalTotalSupply)) {
            const currentRound = await contract.methods.currentStage().call();
            if (currentRound >= 0 && currentRound < 2) {
              softCap = web3.utils.toWei(softCap.toString(), 'ether');
              const contractFunction = contract.methods.updateSoftCap(softCap); // Here you can call your contract functions
              if (contractFunction && contractFunction != undefined) {
                const functionAbi = contractFunction.encodeABI();
                commonService.sendSignedTransactionAdmin(functionAbi, function(error, txHash) {
                  if (!error) return commonService.sendResponse(res, 200, 200, 'SoftCap updated Successfully', { txhash: txHash });
                  else return commonService.sendResponse(res, 500, 500, 'Some Error Occurred', null);
                });
              } else return commonService.sendResponse(res, 500, 500, 'Some Error Occurred during contract function call', null);
            } else
              return commonService.sendResponse(
                res,
                500,
                500,
                'Error. Cant update in below conditions. 1.Sale has not started || 2. Already in crowdsale || 3. Sale Ended',
                null
              );
          } else return commonService.sendResponse(res, 500, 500, 'SoftCap value cant be greater than Hardcap', null);
        } else return commonService.sendResponse(res, 500, 500, 'Error while connecting to contract', null);
      } else return commonService.sendResponse(res, 500, 500, 'SoftCap value not proper', null);
    } else return commonService.sendResponse(res, 500, 500, 'Request Params Missing', null);
  } catch (err) {
    console.log('Error occurred in update softCap API..', err);
    commonService.sendResponse(res, 404, 404, 'Something went wrong.', null);
  }
};

exports.download = async (req, res) => {
  let file = path.resolve('./public/uploads/kyc/' + req.params.folder + '/' + req.params.file);
  console.log(file);
  res.download(file, err => {
    // var file = req.params.file;
    // var fileLocation = path.join(`../../../public/uploads/kyc/${req.params.folder}`, file);
    // console.log(fileLocation);
    if (err) return commonService.sendResponse(res, 404, 404, 'File not Found', null);
  });
};
