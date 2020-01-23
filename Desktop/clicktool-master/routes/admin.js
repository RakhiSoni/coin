let express = require('express');
let router = express.Router();
let frontConstant = require('./../modules/front_constant');
let constants = require('./../modules/constants');
const adminController = require('../controllers/api/admin.controller');
const adminMiddleware = require('../middleware/admin.middleware');

let multer = require('multer');
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname == `profilePicture`) cb(null, 'public/uploads/profile_picture');
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

router.get('/', function(req, res, next) {
  var renderParams = {
    layout: 'admin-login',
    title: 'Login',
    frontConstant: frontConstant,
    constants: constants
  };
  res.render('admin/login', renderParams);
});

router.get('/login', function(req, res, next) {
  let renderParams = {
    layout: 'admin-login',
    title: 'admin-Login',
    frontConstant: frontConstant,
    constants: constants
  };
  res.render('admin/login', renderParams);
});

router.get('/dashboard', adminMiddleware.authenticate, adminController.getDashboard);

router.get('/users', adminMiddleware.authenticate, adminController.getUsers);

router.get('/user-details', adminMiddleware.authenticate, adminController.getUserById);

router.get('/wallets', adminMiddleware.authenticate, adminController.getEtherWallet);

router.get('/kyc-request', adminMiddleware.authenticate, adminController.getKYCRequest);

router.get('/kyc-details', adminMiddleware.authenticate, adminController.getKYCById);

router.get('/kyc-details-view', adminMiddleware.authenticate, adminController.getKYCByIdView);

router.get('/transactions', adminMiddleware.authenticate, adminController.getHistory);

router.get('/token-transfer', adminMiddleware.authenticate, function(req, res, next) {
  let renderParams = {
    layout: 'admin-main',
    title: 'admin-token-transfer',
    frontConstant: frontConstant,
    constants: constants,
    admin: req.session.adminLogin
  };
  res.render('admin/token-transfer', renderParams);
});

router.get('/reset-password/:token', adminController.reset_Password);

router.get('/logout', adminController.logout);

router.get('/profile', adminMiddleware.authenticate, adminController.getProfile);

router.get('/test', adminMiddleware.authenticate, function(req, res, next) {
  let renderParams = {
    layout: 'admin-main',
    title: 'admin-dashboard',
    frontConstant: frontConstant,
    constants: constants,
    admin: req.session.adminLogin
  };
  res.render('admin/test', renderParams);
});

router.post('/login', adminController.login);

router.post('/kyc-status-update/:userId', adminMiddleware.authenticate, adminController.updateKYCStatus);

router.post('/generalTranferTokens', adminMiddleware.authenticate, adminController.generalTransferTokens);

router.post('/tranferTokens', adminMiddleware.authenticate, adminController.transferTokens);

router.post('/createUser', adminMiddleware.authenticate, adminController.createUser);

router.post('/changePassword', adminMiddleware.authenticate, adminController.updatepassword);

router.post('/updateProfile', adminMiddleware.authenticate, upload.single('profilePicture'), adminController.updateProfile);

router.get('/startNextRound', adminMiddleware.authenticate, adminController.startNextRound);

router.post('/updateSoftCap', adminMiddleware.authenticate, adminController.updateSoftCap);

router.post('/forgotPassword', adminController.forgotPassword);

router.post('/resetPassword', adminController.resetPassword);

router.get('/download/:folder/:file', adminController.download);

module.exports = router;
