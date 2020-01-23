const express = require('express');
const router = express.Router();

const users = require('./api/users.route');
const wallets = require('./api/wallets.route');
const admin = require('./api/admin.route');
const payment = require('./api/payment.route');
//const wallets = require('./api/wallets.route');

router.use('/users', users);
router.use('/wallets', wallets);
router.use('/admin', admin);
router.use('/payment', payment);
//router.use('/wallets', wallets);

module.exports = router;
