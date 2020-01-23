// Define routes for Admin APIs.
const express = require('express');
const router = express.Router();
const adminMiddleWare = require('../../middleware/admin.middleware.js');

// Get user controller instance.

const adminController = require('../../controllers/api/admin.controller');

// router.post('/getOwnerTokenBalance', userMiddleWare.authenticateAdminApi, adminController.getTokenBalance);
// router.post('/getAccessToken', adminController.getAccessToken);
// router.get('/getDashboard', userMiddleWare.authenticateAdminApi, adminController.getDashboard);
// router.post('/getUserList', userMiddleWare.authenticateAdminApi, adminController.getUserList);
// router.post('/transferTokensToAllUsers', userMiddleWare.authenticateAdminApi,userMiddleWare.authenticateAdmin2FA, adminController.transferTokensToAllUsers);
// router.post('/executeAirDrop', userMiddleWare.authenticateAdminApi,userMiddleWare.authenticateAdmin2FA, adminController.executeAirDrop);

// router.post('/tokenExchangeRate', userMiddleWare.authenticateAdminApi, adminController.tokenExchangeRate)
// //router.post('/pauseICO', userMiddleWare.authenticateAdminApi,userMiddleWare.authenticateAdmin2FA,adminController.pauseICO);
// //router.post('/resumeICO', userMiddleWare.authenticateAdminApi,userMiddleWare.authenticateAdmin2FA ,adminController.resumeICO);
// router.post('/pauseICO', userMiddleWare.authenticateAdminApi,userMiddleWare.authenticateAdmin2FA,adminController.pauseICO);
// router.post('/resumeICO', userMiddleWare.authenticateAdminApi,userMiddleWare.authenticateAdmin2FA,adminController.resumeICO);
// router.post('/userTransactions',userMiddleWare.authenticateAdminApi,adminController.userTransactions);
// router.post('/userReferrals',userMiddleWare.authenticateAdminApi,adminController.userReferrals);
// router.post('/startCrowdsaleStage', userMiddleWare.authenticateAdminApi,userMiddleWare.authenticateAdmin2FA, adminController.startCrowdsaleStage);
// router.post('/listOfCrowdsaleStages', userMiddleWare.authenticateAdminApi, adminController.listOfCrowdsaleStages);
// router.post('/getWalletList', userMiddleWare.authenticateAdminApi, adminController.getWalletList);
// router.post('/changeCrowdsaleParameters', userMiddleWare.authenticateAdminApi,userMiddleWare.authenticateAdmin2FA, adminController.changeCrowdsaleParameters);
// router.post('/getTransactionHistory', userMiddleWare.authenticateAdminApi, adminController.getTransactionHistory);
// router.post('/addAdminUser', userMiddleWare.authenticateSupreAdmin, adminController.addAdminUser);
// router.post('/listAdminUser', userMiddleWare.authenticateSupreAdmin, adminController.listAdminUser);
// router.post('/approveAdminUser', userMiddleWare.authenticateSupreAdmin, adminController.approveAdminUser);
// router.post('/revokeAdminUser', userMiddleWare.authenticateSupreAdmin, adminController.revokeAdminUser);
// router.post('/adminLogout', userMiddleWare.authenticateAdminApi, adminController.adminLogout);
// router.post('/setUpdateSecondPassword', userMiddleWare.authenticateAdminApi, adminController.setUpdateSecondPassword);
// router.post('/changePassword', userMiddleWare.authenticateAdminApi, adminController.changePassword);
// router.post('/verifySecondPassword', userMiddleWare.authenticateAdminApi, adminController.verifySecondPassword);
// router.post('/verifyThirdPassword', userMiddleWare.authenticateAdminApi, adminController.verifyThirdPassword);
// router.post('/endCrowdsaleStage',userMiddleWare.authenticateAdminApi, adminController.endCrowdsaleStage);

// router.post('/login', adminController.login);
// router.get('/dashboard', adminMiddleWare.authenticate, adminController.getDashboard);
// router.post('/forgotPassword', adminController.forgotPassword);
// router.post('/resetPassword', adminController.resetPassword);
// router.post('/users', adminController.getUsers);
// router.post('/users/userDetails', adminController.getUserById);
// router.post('/users/createUser', adminController.createUser);
// router.post('/kycRequest', adminController.getKYCRequest);
// router.post('/kycRequest/kycRequestById', adminController.getKYCById);
// router.post('/kycRequest/kycRequestById/updateStatus', adminController.updateKYCStatus);
// router.post('/tranferTokens', adminController.transferTokens);
// router.post('/generalTranferTokens', adminController.generalTransferTokens);
// router.post('/viewTransactionHistory', adminController.getHistory);
// router.post('/wallet/ether', adminController.getEtherWallet);
// router.post('/wallet/bitcoin', adminController.getBitcoinWallet);
// router.post('/wallet/usd', adminController.getUSDWallet);
// router.post('/logout', adminController.logout);

// Export the router.
module.exports = router;
