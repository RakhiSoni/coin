// Get user model.
const user = require('../models/Member');
const AccessToken = require('../models/AccessToken');
const Referral = require('../models/Referral');
const Query = require('../models/Query');
const bcrypt = require('bcryptjs');
const cleaner = require('deep-cleaner');
const common = require('./common.service');
const config = require('../modules/constants');
const async = require('async');
const waterfall = require('async-waterfall');
const mailer = require('../modules/mailer');

exports.signup = async function(userdata) {
  let newUser = new user({
    firstname: userdata.firstname,
    lastname: userdata.lastname,
    email: userdata.email,
    phone: userdata.phone,
    countryCode: userdata.countryCode,
    passwordConfirm: userdata.passwordConfirm,
    referralCode: userdata.referralCode,
    referredBy: userdata.referredBy
  });
  try {
    // Save user.
    let saveduser = await newUser.save();
    if (saveduser) {
      saveduser.passwordConfirm = '';
      return saveduser;
    } else return;
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error while creating user');
  }
};
exports.editUser = async function(req, userdata) {
  let editUser = {
    firstname: userdata.firstname,
    lastname: userdata.lastname,
    phone: userdata.phone,
    dob: userdata.dob,
    country: userdata.country,
    countryCode: userdata.countryCode,
    company: userdata.company,
    username: userdata.username,
    profilePicture: userdata.profilePicture
  };
  try {
    var updateduser = await user.update(
      {
        _id: req.authenticationId.userId
      },
      editUser
    );
    if (updateduser.n == 1) {
      var userData = user.findOne({ _id: req.authenticationId.userId });
      return userData;
    }
  } catch (exception) {
    throw Error('Error while updating user');
  }
};
// Generates a password hash.
async function genPassHash(plainTextPassword) {
  const saltRounds = 10;
  const passHash = await bcrypt.hash(plainTextPassword, saltRounds);
  return passHash;
}
// Generates a random string.
function genRandomString(length, callback) {
  var text = '';
  var characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < length; i++) {
    text += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
  }

  callback(Date.now() + text);
}
exports.checkToken = async function(token) {
  try {
    var checkToken = await user.findOne({ resetPasswordToken: token }, 'id emailVerified isforgotPassword');
    return checkToken;
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error while checking token');
  }
};
exports.updateUserToken = async function(id) {
  try {
    var checkToken = await user.update({ _id: id }, { $set: { emailVerified: true, verificationToken: null } });
    return checkToken;
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error while updating email');
  }
};
exports.forgotpwd = function(email, callback) {
  try {
    // check user.
    user.findOne({ email: email }, function(err, checkEmail) {
      if (!err) {
        callback(null, checkEmail);
      } else {
        callback(null, {});
      }
    });
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error while checking email');
  }
};
exports.updateNewToken = function(id, callback) {
  try {
    genRandomString(5, function(newToken) {
      var obj = {};
      user.update({ _id: id }, { $set: { verificationToken: newToken } }, function(error, updateToken) {
        if (updateToken) {
          obj.token = newToken;
          obj.response = updateToken.n;
          callback(null, obj);
        } else {
          callback(null, obj);
        }
      });
    });
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error while updating email');
  }
};
exports.userData = function(id, callback) {
  try {
    user.findOne({ _id: id }, '_id firstname lastname email emailVerified ', function(error, userData) {
      callback(null, userData);
    });
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error');
  }
};
exports.updatePassword = async function(token, password) {
  try {
    var newpassword = await genPassHash(password);
    var updatePassword = await user.update({ verificationToken: token }, { $set: { password: newpassword, passwordConfirm: password } });
    var updateToken = await user.update({ verificationToken: token }, { $set: { verificationToken: null } });
    return updateToken;
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error while updating email');
  }
};
exports.updateEmailVerify = async function(token) {
  try {
    var updatePassword = await user.update({ verificationToken: token }, { $set: { emailVerified: true } });
    var updateToken = await user.update({ verificationToken: token }, { $set: { verificationToken: null } });
    return updateToken;
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error while updating email');
  }
};
exports.signin = async function(userdetails) {
  try {
    // check user.
    var checkedUser = await user.findOne({ email: userdetails.email });
    return checkedUser;
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error while creating user');
  }
};

exports.addUpdateFCMToken = function(req, fcmUpdate, callback) {
  try {
    // check user.
    user.update({ _id: req.authenticationId.userId }, { $set: { fcmToken: fcmUpdate.fcmToken } }, function(err, update) {
      if (!err) {
        callback(null, update);
      } else {
        callback(err, err);
      }
    });
  } catch (exception) {
    // return an error message describing the reason.
    callback(err, 'Error while Updating Token');
  }
};
exports.chkSignIn = async function(result, password) {
  try {
    var obj = {};
    if (result != null) {
      if (result.emailVerified != false) {
        if (result.isActive != false) {
          /* compare the password */
          if (bcrypt.compareSync(password, result.password) === true) {
            obj.error = 0;
            obj.id = result.id;
            obj.email = result.email;
            obj.name = result.name;
            obj.emailVerified = result.emailVerified;
            obj.isActive = result.isActive;
            return obj;
          } else {
            obj.error = 1;
            obj.msg = 'Invalid Password';
            return obj;
          }
        } else {
          obj.error = 1;
          obj.msg = 'User in not activated';
          return obj;
        }
      } else {
        obj.error = 1;
        obj.msg = 'Email not verified';
        return obj;
      }
    } else {
      obj.error = 1;
      obj.msg = "User doesn't exist";
      return obj;
    }
  } catch (exception) {
    // return an error message describing the reason.
    throw Error('Error while creating user');
  }
};
exports.verifyOtp = function(req, data, callback) {
  user.findOne({ _id: req.authenticationId.userId, otp: data.otp }, function(error, details) {
    if (details) {
      user.update({ _id: req.authenticationId.userId, otp: data.otp }, { $set: { otp: '' } }, function(err, succ) {
        if (succ) {
          callback(null, succ);
        } else {
          callback(err, {});
        }
      });
    } else {
      callback(error, error);
    }
  });
};
exports.sendOtp = function(req, callback) {
  user.findOne({ _id: req.authenticationId.userId }, function(error, details) {
    if (details) {
      var otp = Math.floor(1000 + Math.random() * 9000);
      common.sendsms(details, otp, function(error, messageid) {
        if (messageid) {
          user.update({ _id: req.authenticationId.userId }, { $set: { otp: otp } }, function(err, su) {
            if (err) {
              callback(err, {});
            } else {
              callback(null, su);
            }
          });
        } else {
          callback(error, error);
        }
      });
    } else {
      callback(error, {});
    }
  });
};
// exports.getUserRewards = function (req,callback) {
//     user.findOne({_id: req.authenticationId.userId}, function (er, details) {
//         var data = {};
//         data.totalEathers = 0;
//         if (details) {
//             data.referralCode = details.referralCode;
//             data.totalRewards = [];
//             Referral.find({userIdThatRefers: req.authenticationId.userId}, function (error, referral) {
//                 if (referral.length > 0) {
//                     var referes = [];
//                     _.forEach(referral, function (val, key) {
//                         data.totalEathers = parseFloat(val.etherRewarded) + parseFloat(data.totalEathers);
//                         var refer = {};
//                         refer.etherRewarded = (val.etherRewarded / config.DECIMALS);
//                         refer.amountOfEther = (val.amountOfEther / config.DECIMALS);
//                         refer.dateAssigned = val.dateAssigned;
//                         user.findOne({_id: val.userIdThatBuys}, function (error, userdata) {
//                             if (userdata) {
//                                 refer.fullname = userdata.firstname + ' ' + userdata.lastname;
//                             } else {
//                                 console.log(error);
//                             }
//                         });
//                         referes.push(refer);
//                     });
//                     data.totalRewards = referes; g
//                     data.totalEathers = (data.totalEathers / config.DECIMALS);
//                     callback(null, data);
//                 } else if (error) {
//                     callback(error, null);
//                 } else {
//                     callback(null, data);
//                 }
//             });
//         }
//     });

// };

exports.getUserRewards = function(req, callback) {
  waterfall(
    [
      function(callbackOnee) {
        user.findOne({ _id: req.authenticationId.userId }, function(er, details) {
          var data = {};
          data.totalEathers = 0;

          if (details) {
            data.referralCode = details.referralCode;
            data.totalRewards = [];
            callbackOnee(null, data);
          }
        });
      },
      function(data1, callbackTwoo) {
        var referes = [];
        Referral.find({ userIdThatRefers: req.authenticationId.userId, rewardStatus: 'completed' }, function(error, referral) {
          if (referral.length > 0) {
            async.eachSeries(
              referral,
              function(val, callbackS) {
                data1.totalEathers = parseFloat(val.etherRewarded) + parseFloat(data1.totalEathers);
                data1.totalEathers = data1.totalEathers / config.DECIMALS;
                var refer = {};
                refer.etherRewarded = val.etherRewarded / config.DECIMALS;
                refer.amountOfEther = val.amountOfEther / config.DECIMALS;
                refer.dateAssigned = val.dateAssigned;
                user.findOne({ _id: val.userIdThatBuys }, function(error, userdata) {
                  if (userdata) {
                    refer.fullname = userdata.firstname + ' ' + userdata.lastname;
                    referes.push(refer);
                  } else {
                    console.log(error);
                  }
                  callbackS();
                });
              },
              function() {
                data1.totalRewards = referes;
                callbackTwoo(null, data1, referes);
              }
            );
          } else if (error) {
            callback(error, null);
          } else {
            callback(null, data1);
          }
        });
      }
    ],
    function(error, data2, referrees) {
      if (error) {
        console.log('error in water fall', error);
      } else {
        callback(null, data2);
      }
    }
  );
};

exports.updateQuery = function(data, callback) {
  var newQuery = new Query({
    name: data.name,
    phone: data.phone,
    email: data.email,
    message: data.message
  });
  var templateVariable = {
    templateURL: 'mailtemplate/contactUs',
    email: data.email,
    message: data.message,
    name: data.name
  };
  var mailParamsObject = {
    templateVariable: templateVariable,
    to: config.MAIL_FROM_AUTH,
    subject: 'Contact Us'
  };
  mailer.sendMail(mailParamsObject, function(err) {
    if (err) {
      callback('Mail not sent', {}, {});
    } else {
      newQuery.save(function(err, savedQuery) {
        if (err) {
          callback(err, {}, {});
        }
        callback(null, savedQuery);
      });
    }
  });
};

exports.logOut = function(req, callback) {
  AccessToken.deleteOne({ _id: req.query.access_token }, function(error) {
    if (error) {
      callback(error, error);
    } else {
      callback(null, 'user logged out');
    }
  });
};

exports.referralData = async id => {
  let user1 = await user.findOne({ _id: id });
  if (user1) {
    data = {
      referralCode: user1.referralCode,
      referralTokensCount: user1.referralTokenCount,
      totalReferrals: user1.referralCount,
      referralTransaction: user1.referralTokenTransactions
    };
    return data;
  } else return;
};
