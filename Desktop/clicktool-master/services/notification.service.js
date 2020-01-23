// Get user model.
var user = require('../models/Member');
var Notifications = require('../models/Notifications');
var AccessToken = require('../models/AccessToken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var cleaner = require('deep-cleaner');
var common = require('./common.service');
var jwt = require('jsonwebtoken');
var constants = require('../modules/constants');
var moment = require('moment');
var ObjectId = mongoose.Schema.Types.ObjectId;
const axios = require('axios');
const _ = require('lodash');
var notify = require('../modules/notification');
var mailer = require('../modules/mailer');

exports.notifyUser = function(userId, data, callback) {
  var noti = new Notifications({
    type: data.type,
    title: data.title,
    memberId: userId,
    message: data.message,
    createdAt: data.createdAt
  });

  'notificaiondata', noti;
  noti.save(function(err, notif) {
    if (notif) {
      'savedNotifation :', notif;
      user.findOne({ _id: userId }, function(error, user) {
        if (user) {
          notify.sendNotificaiton(user.fcmToken, notif, function(n) {
            'Successfully send nottificaion', n;
            callback(n);
          });
        } else {
          callback(error);
        }
      });
    } else {
      'error', err;
      callback(err);
    }
  });

  user.findOne({ _id: userId }, function(error, user) {
    if (user) {
      var templateVariable = {
        templateURL: 'mailtemplate/' + data.email_temp,
        fullName: user.firstname + ' ' + user.lastname,
        coins: data.coins,
        totalBalance: data.totalBalance ? data.totalBalance : 0,
        FRONT_BASE_URL: constants.ACCESSURL,
        message: data.message
      };
      var mailParamsObject = {
        templateVariable: templateVariable,
        to: user.email,
        subject: data.title
      };

      mailer.sendMail(mailParamsObject, function(error, info) {
        if (error) {
          error;
        } else {
          info;
          ('Success');
        }
      });
    } else {
      error;
    }
  });
};

exports.getUserNotification = function(req, callback) {
  Notifications.find({ memberId: req.authenticationId.userId, isDelete: false }, null, { sort: '-createdAt' }, function(errors, notifications) {
    if (notifications.length > 0) {
      callback(null, notifications);
    } else if (errors) {
      callback(errors, null);
    } else {
      callback(errors, []);
    }
  });
};

exports.readClearNotification = function(req, data, callback) {
  if (data.notificationId) {
    Notifications.update({ _id: data.notificationId }, { $set: { isRead: true } }, function(error, read) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, read);
      }
    });
  } else {
    Notifications.update({ memberId: req.authenticationId.userId }, { $set: { isDelete: true } }, { multi: true }, function(error, clear) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, clear);
      }
    });
  }
};

exports.sendAdminEmail = function(data, callback) {
  var templateVariable = {
    templateURL: 'mailtemplate/' + data.email_temp,
    fullName: data.details.firstname + ' ' + data.details.lastname,
    FRONT_BASE_URL: constants.ACCESSURL,
    details: data.details
  };
  var mailParamsObject = {
    templateVariable: templateVariable,
    to: data.details.email,
    subject: data.title
  };

  mailer.sendMail(mailParamsObject, function(error, info) {
    if (error) {
      error;
    } else {
      info;
      ('Success');
    }
  });
};
