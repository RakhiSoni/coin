var express = require('express');
var router = express.Router();
var frontConstant = require('./../modules/front_constant');
var constants = require('./../modules/constants');
const userController = require('../controllers/user.controller');
const userMiddleware = require('../middleware/user.middleware');
var Facebook = require('facebook-node-sdk');
var countries = require('country-list')();

router.get('/', userMiddleware.isLogin, function(req, res, next) {
  var renderParams = {
    layout: 'login',
    title: 'Login',
    frontConstant: frontConstant,
    constants: constants
  };
  res.render('login', renderParams);
});

router.post('/login', userController.signin);

router.get('/logout', userMiddleware.userSignout);

router.get('/register', userMiddleware.isLogin, function(req, res, next) {
  var renderParams = {
    layout: 'login',
    title: 'Register',
    frontConstant: frontConstant,
    country: countries.getData()
  };
  res.render('register', renderParams);
});
router.post('/register', userMiddleware.validateSignupData, userController.signup);

router.get('/verify-email/:token', userController.verifyEmail);

router.get('/reset-password/:token', userController.reset_Password);

router.post('/reset-password', userController.resetpassword);

router.get('/facebook_login', Facebook.loginRequired(), function(req, res) {
  req.facebook.api('/me', function(err, user) {
    //        res.writeHead(200, {'Content-Type': 'text/plain'});
    res.send('Hello, ' + user.name + '!');
  });
});
module.exports = router;
