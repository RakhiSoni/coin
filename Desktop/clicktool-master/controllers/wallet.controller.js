// Access user service.
const User = require('../models/Member');
const walletService = require('../services/wallet.service');
const userService = require('../services/user.service');
const constants = require('../modules/constants');
var Wallet = require('../models/wallet');
var handlebarhelpers = require('../modules/handlebarhelpers');
var QRCode = require('qrcode');

exports.wallets = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'My Wallets',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  walletService.getSavedWallets(req, req.body, function(error, wallets) {
    if (wallets.length > 0) {
      renderParams.wallets = wallets;
      renderParams.numberOfWallets = wallets.length;
    }
    res.render('wallets', renderParams);
  });
};
exports.addWallet = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Add Wallet',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  res.render('addWallet', renderParams);
};

exports.addNewWallet = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Add Wallet',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  req.body.mnemonic = req.session.mnemonic;
  walletService.addWallet(req, req.body, function(error, newWalletObject) {
    if (!error) {
      var data = {
        name: newWalletObject.name,
        walletAddress: newWalletObject.walletAddress
      };
      renderParams.data = data;
      res.render('showCreatedWallet', renderParams);
    } else {
      res.render('showCreatedWallet', renderParams);
    }
  });
};
exports.editWallet = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Edit Wallet',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  if (req.query.wallet) {
    Wallet.findOne({ _id: req.query.wallet }, function(error, wallet) {
      if (!error) {
        renderParams.wallet = wallet;
      }
      res.render('editWallet', renderParams);
    });
  } else {
    walletService.editWallet(req, req.body, function(error, edit) {
      if (!error) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Wallet Updated Successfully!!',
          error: 0
        });
      } else {
        return res.status(201).json({
          statusCode: 201,
          message: 'Something went wrong please try again.',
          error: 1
        });
      }
    });
  }
};
exports.generateRecoveryPhrase = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Recovery Phrase',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  walletService.addHDWallet(req, req.body, function(error, mnemonic, address, privatekey) {
    if (!error) {
      var data = {
        mnemonic: mnemonic,
        address: address,
        privatekey: privatekey
      };
      renderParams.wallet = data;
      req.session.mnemonic = mnemonic;
      var wallets = [];
      wallets[address] = privatekey;

      'array of wallets', wallets;
      'response', data;
      'request object', renderParams.wallet;
      res.render('generateRecoveryPhrase', renderParams);
    } else {
      res.redirect('/');
    }
  });
};
exports.verifyRecoveryPhrase = function(req, res, next) {
  if (req.body.mnemonic) {
    if (req.body.mnemonic == req.session.mnemonic) {
      req.session.userLogin.user.mnemonicGenerated = 'true';
      return res.status(200).json({
        status: 200,
        message: 'Mnemonic Verified Successfully!!',
        error: 0
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: 'Mnemonic not matched please try again',
        error: 1
      });
    }
  } else {
    var renderParams = {
      layout: 'main',
      title: 'Verify Recovery Phrase',
      constants: constants,
      user: req.session.userLogin,
      handlebarhelpers: handlebarhelpers
    };
    res.render('verifyRecoveryPhrase', renderParams);
  }
};
exports.getMnemonicPhrase = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Recovery Phrase',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  res.render('getMnemonicPhrase', renderParams);
};
exports.verifyMnemonicPhrase = function(req, res, next) {
  walletService.retrieveHDWallet(req, function(error, success) {
    if (!error) {
      req.session.mnemonic = req.body.mnemonic;
      return res.status(200).json({
        status: 200,
        message: 'Mnemonic Verified Successfully!!',
        error: 0
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: success + ' please try again',
        error: 1
      });
    }
  });
};
exports.deleteWalletAddress = function(req, res, next) {
  walletService.deleteWalletAddress(req, req.body, function(error, deletAddress) {
    deletAddress;
    if (!error) {
      return res.status(200).json({
        status: 200,
        message: 'Wallet Deleted Successfully!!',
        error: 0
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: deletAddress + ' please try again',
        error: 1
      });
    }
  });
};
exports.defaultWalletAddress = function(req, res, next) {
  walletService.setDefaultWallet(req, req.body, function(error, defaultAddress) {
    defaultAddress;
    if (!error) {
      return res.status(200).json({
        status: 200,
        message: 'Wallet Set As Default!!',
        error: 0
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: defaultAddress + ' please try again',
        error: 1
      });
    }
  });
};
exports.buyWithEther = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Buy With Ethers',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  walletService.getTotalEtherEstimate(req.body, function(error, amount_of_tokens, amount, gasUsedInEther, totalEther) {
    if (!error) {
      var data = {};
      data.amount_of_tokens = amount_of_tokens;
      data.amount = amount;
      data.gasUsedInEther = gasUsedInEther;
      data.totalEther = totalEther;
      data.wallet_address = req.body.wallet_address;
      data.mnemonic = req.session.mnemonic;
      data.ckc_per_ether = req.body.ckc_per_ether;
      data.wallet_index = req.body.wallet_index;
      renderParams.etherValue = data;
    }
    res.render('buyWithEthers', renderParams);
  });
};
exports.referralsStatements = async function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Referrals',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  let user = await userService.referralData(req.authenticationId.userId);
  console.log(user);
  if (user) {
    renderParams.reffral = user;
    res.render('referralRewards', renderParams);
  } else {
    res.render('referralRewards', renderParams);
  }
};

exports.myAddress = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'My Addresss',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  Wallet.findOne({ memberId: req.session.userLogin.userId, defaultAddress: true }, function(error, defWallet) {
    if (defWallet) {
      defWallet;
      renderParams.wallet = defWallet;
      QRCode.toDataURL(defWallet.walletAddress, function(err, url) {
        renderParams.qrCode = url;
        res.render('myAddress', renderParams);
      });
    }
  });
};
exports.buyWithBitcoin = function(req, res, next) {
  req.body.price = req.body.tokens / req.body.ckc_per_btc;
  walletService.buyWithBTC(req, req.body, function(error, objInvoice) {
    if (!error) {
      return res.status(200).json({
        status: 200,
        message: 'Buy With BTC Success!!',
        invoice: objInvoice,
        error: 0
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: error + ' please try again',
        error: 1
      });
    }
  });
};
