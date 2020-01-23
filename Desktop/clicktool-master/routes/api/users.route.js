// Define routes for user APIs.
const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/user.middleware');

// Get user controller instance.
const userController = require('../../controllers/api/user.controller');
const tradeController = require('../../controllers/api/trade.controller');
const notificationController = require('../../controllers/api/notification.controller');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: (req, files, cb) => {
    if (files.fieldname == `docImage`) cb(null, 'public/uploads/kyc/docImage');
    else if (files.fieldname == `docHoldingImage`) cb(null, 'public/uploads/kyc/docHoldingImage');
    else if (files.fieldname == 'utilityBill') cb(null, 'public/uploads/kyc/utilityBill');
    else cb(null, 'public/uploads/profile_picture');
  },
  filename: (req, file, cb) => {
    if (file.originalname.indexOf(' ')) {
      file.originalname = file.originalname.replace(/ /g, '_');
    }
    var ext = file.originalname.split('.');
    cb(null, file.fieldname + '-' + Date.now() + '.' + ext[1]);
  }
});
var upload = multer({ storage: storage });

// Mapping routes to user controller functions.
// Middlewares are used.
router.post('/signup', userMiddleware.validateSignupData, userController.signup);

// router.get('/verify-email/:token', userController.verifyemail);

router.post('/forgot-password', userController.forgotpwd);

router.post('/reset-password', userController.resetpassword);

router.post('/signin', userController.signin);

router.post('/login', userController.login);

router.get('/get-profile', userMiddleware.authenticateApi, userController.getProfile);

router.post('/edit-profile', userMiddleware.authenticateApi, upload.single('profilePicture'), userController.editProfile);

// router.post('/buy-token', userMiddleware.checkMnemonicSession, tradeController.buyTokens);

router.post('/notifications', userMiddleware.authenticateApi, notificationController.getNotifications);

router.post(
  '/read-clear-notifications',
  userMiddleware.checkMnemonicSession,
  userMiddleware.authenticateApi,
  notificationController.readClearNotifications
);

router.post('/update-fcm-token', userMiddleware.authenticateApi, userController.updateFCMToken);

router.post('/statements', /*userMiddleware.checkMnemonicSession,*/ userMiddleware.authenticateApi, tradeController.getStatements);

router.post('/statements-download', /*userMiddleware.authenticateApi, */ tradeController.downloadStatements);

router.post('/rewards', userMiddleware.authenticateApi, userController.getUserRewards);

router.post('/contact-us', userMiddleware.authenticateApi, userController.contactUs);

router.post('/logout', userMiddleware.authenticateApi, userController.logout);

router.post('/verify-otp', userMiddleware.authenticateApi, userController.verifyOtp);

router.post('/send-otp', userMiddleware.authenticateApi, userController.sendOtp);

router.get('/test-noti', userController.sendNoti);

// router.post('/KYC-varification', userMiddleware.checkMnemonicSession, userController.updateKYCStatus);

router.post('/kycDocumentsUpload1', userMiddleware.authenticate, userController.postKYCDocuments1);

router.post('/kycDocumentsUpload1App', userMiddleware.authenticateApi, userController.postKYCDocuments1);

router.post(
  '/kycDocumentsUpload2',
  userMiddleware.authenticate,
  upload.fields([
    { name: 'docImage', maxCount: 1 },
    { name: 'docHoldingImage', maxCount: 1 },
    { name: 'utilityBill', maxCount: 1 }
  ]),
  userController.postKYCDocuments2
);

router.post(
  '/kycDocumentsUpload2App',
  userMiddleware.authenticateApi,
  upload.fields([
    { name: 'docImage', maxCount: 1 },
    { name: 'docHoldingImage', maxCount: 1 },
    { name: 'utilityBill', maxCount: 1 }
  ]),
  userController.postKYCDocuments2
);

router.post('/kycDocumentsUpload3', userMiddleware.authenticate, userController.postKYCDocuments3);

router.get('/kycDocumentsUpload3App', userMiddleware.authenticateApi, userController.postKYCDocuments3);

router.get('/getKYCDocuments', userMiddleware.authenticate, userController.getKYCDocuments);

router.get('/getKYCDocumentsApp', userMiddleware.authenticateApi, userController.getKYCDocuments);

router.get('/getReferralDetails1', userMiddleware.authenticate, userController.getReferralDetails);

router.get('/getReferralDetails2', userMiddleware.authenticateApi, userController.getReferralDetails);

router.post('/state-list', userController.getStateList);

router.post('/city-list', userController.getCityList);

router.get('/country-list', userController.getcountryList);

router.post('/getRates', userController.getRates);

router.get('/getTACBalance', userMiddleware.authenticate, userController.getTACBalance);

// Export the router.
module.exports = router;
