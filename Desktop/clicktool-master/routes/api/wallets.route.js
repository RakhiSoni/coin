// Define routes for user APIs.
const express = require('express');
const router = express.Router();
const userMiddleWare = require('../../middleware/user.middleware.js');

// Get user controller instance.

const walletController = require('../../controllers/api/wallet.controller');

router.post('/wallet', userMiddleWare.authenticateApi, walletController.getWalletDetails);

router.post('/saved-wallet-list', userMiddleWare.authenticateApi, walletController.savedWalletList);

router.post('/delete-wallet-address', userMiddleWare.authenticateApi, walletController.deleteWalletAddress);

router.post('/add-wallet-address', userMiddleWare.authenticateApi, walletController.addNewWallet);

router.post('/set-default-wallet', userMiddleWare.authenticateApi, walletController.setDefaultWallet);

router.post('/edit-wallet', userMiddleWare.authenticateApi, walletController.editWallet);

router.post('/buy-token', userMiddleWare.authenticateApi, userMiddleWare.getPrivateKey, walletController.buyTokens);

router.post('/buyTACToken', userMiddleWare.authenticate, userMiddleWare.getPrivateKey, walletController.buyTACTokens);
router.post('/buyTACTokenApp', userMiddleWare.authenticateApi, userMiddleWare.getPrivateKey, walletController.buyTACTokens);

router.post('/dashboard', userMiddleWare.authenticateApi, walletController.getWalletDashboard);

router.post('/etherEstimate', userMiddleWare.authenticateApi, walletController.etherEstimate);

router.post('/addhdwallet', userMiddleWare.authenticateApi, walletController.addNewHDWallet);
router.post('/gethdwallets', userMiddleWare.authenticateApi, walletController.retrieveNewHDWallet);
router.post('/notificationOfPayment', walletController.notificationOfPayment);

router.post('/buyWithBitcoin', userMiddleWare.authenticateApi, walletController.buyWithBitcoin);

router.post('/getTokenList', userMiddleWare.authenticateApi, walletController.getTokenList);
router.post('/selectedTokens', userMiddleWare.authenticateApi, walletController.addSelectedTokens);

// Export the router.
module.exports = router;
