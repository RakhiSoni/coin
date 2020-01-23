const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/api/payment.controller')

router.post('pay', paymentController.payWithBTC)
router.post('paymentStatus/:id', paymentController.payentEventById)
router.post('paymentEvents', paymentController.allPaymentEvents)
router.post('paymentResolve/:id/resolve', paymentController.resolvePaymentByCode)
router.post('paymentCharges', paymentController.allPaymentCharge)
router.post('paymentCharges/:id', paymentController.payentChargetById)


module.exports = router;