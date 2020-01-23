var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');
const walletController = require('../controllers/wallet.controller');
const tradeController = require('../controllers/trade.controller');
const userMiddleware = require('../middleware/user.middleware');

/* GET home page. */
router.get('/dashboard', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.getNewdashboard);

router.get('/newDashboard', /*userMiddleware.authenticate, userMiddleware.checkMnemonicSession,*/ userController.dashboard);
// router.get('/transactionHistory', /*userMiddleware.authenticate, userMiddleware.checkMnemonicSession,*/ userController.getTransactionHistory);

// router.post('/buyTokensWithEther', userController.buyTokensWithEther);

router.get('/generate-recovery-phrase', userMiddleware.authenticate, userMiddleware.checkPhraseGenerated, walletController.generateRecoveryPhrase);

router.get('/verify-recovery-phrase', userMiddleware.authenticate, walletController.verifyRecoveryPhrase);

router.get('/get-mnemonic-phrase', userMiddleware.authenticate, walletController.getMnemonicPhrase);

router.post('/verify-recovery-phrase', userMiddleware.authenticate, walletController.verifyRecoveryPhrase);

router.post('/verify-mnemonic-phrase', userMiddleware.authenticate, walletController.verifyMnemonicPhrase);

router.get('/wallets', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.wallets);

router.get('/kyc-verification-1', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.kycverification1);

router.get('/kyc-verification-2', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.kycverification2);

router.get('/kyc-verification-3', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.kycverification3);

router.get('/kyc-under-review', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.kycUnderReview);

router.get('/kyc-verification-failed', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.kycVerificationFailed);

router.get('/kyc-verified', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.kycverification);

router.get('/addWallet', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.addWallet);

router.post('/addWallet', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.addNewWallet);

router.get('/editWallet', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.editWallet);

router.post('/editWalletRequest', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.editWallet);

router.post('/deleteWallet', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.deleteWalletAddress);

router.post('/defaultWallet', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.defaultWalletAddress);

router.post('/buy-with-ether', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.buyWithEther);

router.get('/statements/:type?', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, tradeController.getStatements);

router.get('/referrals', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.referralsStatements);

router.get('/myadddress', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.myAddress);

router.get('/help-and-support', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.helpAndSupport);

router.get('/about-us', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.aboutUs);

router.post('/buyWithBitcoin', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, walletController.buyWithBitcoin);

router.post('/statements-download', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, tradeController.downloadStatements);

router.get('/profile', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.getProfile);

router.get('/get-Kyc-status', userMiddleware.authenticate, userMiddleware.checkMnemonicSession, userController.getKycStatus);

module.exports = router;
