// Access user service.
const userService = require('../../services/user.service');
const constants = require('../../modules/constants');
var mailer = require('../../modules/mailer');
const truffle_connect = require('../../connection/app.js');
var frontConstant = require('../../modules/front_constant');
const commonService = require('../../services/common.service');
const notification = require('../../services/notification.service');

exports.getNotifications = function (req, res, next) {
    notification.getUserNotification(req, function (error, notifications) {
        if (!error) {
            commonService.sendResponse(res, 200, 200, 'List of Notifications', notifications);
        } else {
            commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
        }
    });
};
exports.readClearNotifications = function (req, res, next) {
    notification.readClearNotification(req, req.body, function (error, readClear) {
        if (!error) {
            commonService.sendResponse(res, 200, 200, 'Successfully Clear All notifications', readClear);
        } else {
            commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
        }
    });
};
