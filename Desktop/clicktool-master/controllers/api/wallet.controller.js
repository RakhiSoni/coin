// Access user service.
const userService = require('../../services/user.service');
// Access wallet service.
const walletService = require('../../services/wallet.service');
const commonService = require('../../services/common.service');
const constants = require('../../modules/constants');
var mailer = require('../../modules/mailer');
const truffle_connect = require('../../connection/app.js');
var frontConstant = require('../../modules/front_constant');

exports.getWalletDetails = function(req, res, next) {
  walletService.getDashboardDetails(req, req.body, function(error, wallets) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Dashboard', wallets);
    } else {
      console.log("error...", error);
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};



exports.savedWalletList = function(req, res, next) {
  walletService.getSavedWallets(req, req.body, function(error, wallets) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'List of Saved Wallets', wallets);
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};

exports.setDefaultWallet = function(req, res, next) {
  walletService.setDefaultWallet(req, req.body, function(error, setDefault) {
    setDefault;
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Wallet set to default.', {});
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};

exports.deleteWalletAddress = function(req, res, next) {
  walletService.deleteWalletAddress(req, req.body, function(error, setDefault) {
    setDefault;
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Wallet Deleted Successfully.', {});
    } else if (error == 'error') {
      commonService.sendResponse(res, 400, 400, setDefault, {});
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured', error);
    }
  });
};
exports.editWallet = function(req, res, next) {
  walletService.editWallet(req, req.body, function(error, editWallet) {
    editWallet;
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Wallet Updated Successfully.', {});
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};

exports.addNewWallet = function(req, res, next) {
  walletService.addWallet(req, req.body, function(error, newWalletObject) {
    if (!error) {
      var data = {
        name: newWalletObject.name,
        walletAddress: newWalletObject.walletAddress
      };
      commonService.sendResponse(res, 200, 200, 'New Wallet Added', data);
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};

exports.addNewHDWallet = function(req, res, next) {
  ('Checkpoint1');
  walletService.addHDWallet(req, req.body, function(error, mnemonic, address, name) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Mnemonic Generated', { mnemonic: mnemonic, address: address, name: name });
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};

exports.retrieveNewHDWallet = function(req, res, next) {
  ('Checkpoint1');
  walletService.retrieveHDWallet(req, function(error, newWalletObject) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Wallets of Users', newWalletObject);
    } else if (error == 'wrong_mnemonic') {
      commonService.sendResponse(res, 400, 400, 'Seems like you have entered a wrong mnemonic');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
    }
  });
};

exports.addEthWalletAddress = async function(req, res, next) {
  try {
    var wallet = await walletService.addEthereumWallet(req.body);

    if (wallet) {
      return res.json({
        statusCode: 200,
        message: 'Successfuly Added wallet address.'
      });
    }
  } catch (exception) {
    return res.json({
      status: 'error',
      message: exception.message
    });
  }
};

exports.buyTACTokens = function(req, res, next) {
  if(req.body.tokens && req.body.tokens != undefined) {}
  else commonService.sendResponse(res, 400, 400, 'Please pass token amount to purchase.', {});
  walletService.buyTACTokens(req, req.body, function(error, objTx) {
    console.log("6666666666666666666...................", error, objTx);
  console.log("********************************************");
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'You have submitted the request for buying tokens.', {txHash : objTx});
    } else if (error == 'insufficient_balance') {
      commonService.sendResponse(res, 400, 400, 'You dont have enough balance to execute transaction.', {});
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.buyTokens = function(req, res, next) {
  walletService.buyCKCTokens(req, req.body, function(error, objTx) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'You have submitted the request for buying tokens.', { txHash: objTx });
    } else if (error == 'insufficient_balance') {
      commonService.sendResponse(res, 400, 400, 'You dont have enough balance to execute transaction.', {});
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.buyWithBitcoin = function(req, res, next) {
  walletService.buyWithBTC(req, req.body, function(error, objInvoice) {
    if (!error) {
      'objInvoice', objInvoice;
      commonService.sendResponse(res, 200, 200, 'Invoice Generated', objInvoice);
    } else {
      'error controller', error;
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.notificationOfPayment = function(req, res, next) {
  walletService.paymentStatus(req, req.body, function(error, objPayment) {
    if (!error) {
      'req', req.body;
      'objPayment', objPayment;
      ('Hello It is paid');
      commonService.sendResponse(res, 200, 200, 'Got the IPN');
    } else {
      'error controller', error;
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.storeBTCTransaction = function(req, res, next) {
  walletService.storeBtcTxns(req, req.body, function(error, objStatement) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Transaction is stored.', { statement: objStatement });
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.etherEstimate = function(req, res, next) {
  walletService.getTotalEtherEstimate(req.body, function(error, objTokens, objAmt, objGas, objEther) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Please transfer this amount of ether to your The Abundance Coin address.', {
        Tokens: objTokens,
        Ether: objAmt,
        Gas: objGas,
        totalEther: objEther
      });
    } else if (error == 'something_went_wrong') {
      'error controller', error;
      commonService.sendResponse(res, 400, 400, 'Something went wrong', {});
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.getWalletDashboard = function(req, res, next) {
  walletService.getWallet(req, req.body, function(error, objWallet) {
    if (objWallet) {
      //commonService.sendResponse(res, 200, 200, 'Bought Tokens Successfully', objToken);
      'objWallet', objWallet;
      commonService.sendResponse(res, 200, 200, 'Dashboard', objWallet);
    }
  });
};

exports.getTokenList = function(req, res, next) {
  walletService.getTokens(req.body, function(error, tokenlist) {
    'tokkklist', tokenlist;
    if (tokenlist) {
      commonService.sendResponse(res, 200, 200, 'List Of Tokens', { tokenlist: tokenlist });
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};

exports.addSelectedTokens = function(req, res, next) {
  walletService.selectedTokens(req.body, function(error, walletFound) {
    'tokkklist', walletFound;
    if (walletFound) {
      commonService.sendResponse(res, 200, 200, 'Added Selected Tokens');
    } else {
      commonService.sendResponse(res, 500, 500, 'Some error occured: ' + error, error);
    }
  });
};
