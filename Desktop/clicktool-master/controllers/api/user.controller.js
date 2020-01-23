// Access user service.
const userService = require('../../services/user.service');
const constants = require('../../modules/constants');
var mailer = require('../../modules/mailer');
const Wallet = require('../../models/wallet');
var notification = require('../../modules/notification');
var frontConstant = require('../../modules/front_constant');
var fs = require('fs');
const User = require('../../models/Member');
const AccessToken = require('../../models/AccessToken');
const commonService = require('../../services/common.service');
var jwt = require('jsonwebtoken');
var config = require('../../modules/constants');
const yourhandle = require('countrycitystatejson');
const countries = require('country-list')();
const { abi } = require('../../contractConfig/abi');
const Web3 = require('web3');
const provider = 'https://ropsten.infura.io/v3/5cfea0d474d94d178f030574a25eee02';
const web3 = new Web3(provider);
/*
 exports.createUser = function (req, res, next) {
 
 if (req.body.password != req.body.c_password) {
 return res.status(201)
 .json({
 status: 201,
 data: "",
 message: "Password and Confirm password must match",
 error: 1
 });
 }
 var user_wallet = [];
 try {
 truffle_connect.createWallet(function (wallet) {
 user_wallet = wallet;
 });
 // Get posted request data for the user sign up.    
 var user = {
 name: req.body.name,
 publicAddress: user_wallet.address,
 email: req.body.email,
 password: req.body.password,
 referralCode: req.body.referralCode,
 phone: req.body.phone
 };
 var token = "";
 // Create a new user account using user service object.
 var createdUser = await userService.signup(user);
 if (createdUser != null) {
 token = createdUser.verificationToken;
 }
 */
/******* mail code *******/

/*    var templateVariable = {
 templateURL: "mailtemplate/registration",
 fullName: req.body.firstName + " " + req.body.lastName,
 token: token,
 FRONT_BASE_URL: constants.ACCESSURL
 };
 var mailParamsObject = {
 templateVariable: templateVariable,
 to: req.body.email,
 subject: "Registration Successful."
 };
 obj = {};
 var sessData = req.session;
 obj.id = user.id;
 obj.email = user.email;
 obj.name = user.name;
 obj.emailVerified = user.emailVerified;
 obj.isActive = user.isActive;
 obj.privateKey = user_wallet.privateKey;
 sessData.userLogin = obj;
 mailer.sendMail(req, res, mailParamsObject, function (err) {
 if (err) {
 return res.status(201)
 .json({
 status: 201,
 data: err,
 message: "Mail sending failed.",
 error: 1
 });
 } else {
 return res.status(201)
 .json({
 status: 201,
 data: createdUser,
 privatekey: user_wallet.privateKey,
 message: "User signed up successfully.",
 error: 0
 });
 }
 });*/
/******** mail code *******/
/*
 } catch (exception) {
 (exception);
 // Return an error response with code and message.
 return res.status(500)
 .json({
 status: 500,
 message: "User sign up failed. Something went wrong.",
 error: 1
 });
 }
 };*/

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

exports.signup = async function(req, res, next) {
  try {
    if (req.body.referralCode && req.body.referralCode != undefined) {
      const userrefer = await User.findOne({ referralCode: req.body.referralCode });
      if (userrefer) {
        userrefer.referralCount += 1;
      } else
        return res.status(201).json({
          status: 201,
          data: '',
          message: 'Referred User not found. Please try with correct Referral code',
          error: 1
        });
    }
    if (req.body.password != req.body.c_password) {
      return res.status(201).json({
        status: 201,
        data: '',
        message: 'Password and Confirm password must match',
        error: 1
      });
    }
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser) {
      return res.status(201).json({
        status: 201,
        data: '',
        message: 'User with email  already exists',
        error: 1
      });
    }
    if (req.body.password != req.body.c_password) {
      return res.status(201).json({
        status: 201,
        data: '',
        message: 'Password and Confirm password must match',
        error: 1
      });
    }

    const email = req.body.email;
    // Get posted request data for the user sign up.
    const token = await jwt.sign({ email }, constants.SECRET, { expiresIn: '1d' });
    console.log('Token.....');
    let newUser = new User({
      firstname: req.body.fname,
      lastname: req.body.lname,
      email: req.body.email,
      phone: req.body.phone,
      countryCode: req.body.countryCode,
      passwordConfirm: req.body.password,
      referralCode: randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      referredBy: req.body.referralCode,
      verificationToken: token
    });

    var templateVariable = {
      templateURL: 'mailtemplate/registration',
      fullName: req.body.fname + ' ' + req.body.lname,
      token: token,
      FRONT_BASE_URL: constants.ACCESSURL
    };
    var mailParamsObject = {
      templateVariable: templateVariable,
      to: req.body.email,
      subject: 'Registration Successful.'
    };

    // obj = {};
    // var sessData = req.session;
    // obj.id = user.id;
    // obj.email = user.email;
    // obj.name = user.name;
    // obj.emailVerified = user.emailVerified;
    // obj.isActive = user.isActive;
    // obj.privateKey = user_wallet.privateKey;
    // sessData.userLogin = obj;
    mailer.sendMail(mailParamsObject, async function(err) {
      if (err) return res.status(201).json({ status: 201, data: err, message: 'Mail sending failed.', error: 1 });
      else {
        const saveduser = await newUser.save();
        if (saveduser) {
          delete saveduser['wallets'];
          delete saveduser.password;
          delete saveduser.secretAccessKey;
          delete saveduser.passwordConfirm;
          delete saveduser.fcmToken;
          delete saveduser.otp;
          return res.status(200).json({ status: 200, data: saveduser, message: 'User signed up successfully.Please verify your email', error: 0 });
        } else return res.status(201).json({ status: 201, data: saveduser, message: 'Error while saving to database', error: 1 });
      }
    });
  } catch (exception) {
    console.log('Exception...', exception);
    res.status(500).json({ status: 500, message: 'User sign up failed. Something went wrong.', error: 1 });
  }
};

exports.login = function(req, res, next) {
  // Get posted request data for the user sign in.
  var user = {
    email: req.body.email.toLowerCase(),
    password: req.body.password
  };
  var userFound = {};
  User.findOne({ email: user.email }, function(err, foundUser) {
    foundUser ? (userFound = foundUser.toObject()) : (userFound = {});
    if (err) commonService.sendResponse(res, 500, 500, 'Some error occured ' + error, error);
    else if (!foundUser) return commonService.sendResponse(res, 400, 400, 'User sign up failed.User does not exist.', null);
    else if (foundUser && foundUser.passwordConfirm != user.password) return commonService.sendResponse(res, 400, 400, 'User sign up failed.Invalid Credentials', null);
    else if (foundUser && foundUser.emailVerified !== true) return commonService.sendResponse(res, 400, 400, 'Email Not Verified', {});
    else if (foundUser && foundUser.isWhitelisted !== true) return commonService.sendResponse(res, 400, 400, 'User is not whitelisted', {});
    else {
      var payload = {
        userId: foundUser._id
      };
      var token = jwt.sign(payload, config.SECRET, { expiresIn: '1209600' });

      var newAccessToken = new AccessToken({
        _id: token,
        ttl: 3600000,
        created: '2018-07-11 01:28:18.429',
        userId: foundUser._id
      });
      foundUser.profilePicture != undefined
        ? (userFound.profilePicture = constants.ACCESSURL + 'uploads/profile_picture/' + foundUser.profilePicture)
        : (userFound.profilePicture = '');
      delete userFound['wallets'];
      delete userFound.password;
      delete userFound.secretAccessKey;
      delete userFound.passwordConfirm;
      delete userFound.fcmToken;
      delete userFound.otp;
      newAccessToken.save(function(err, savedToken) {
        if (err) {
          callback(err, null);
        }
        // var response = {
        //     _id:savedToken._id,
        //     ttl: savedToken.ttl,
        //     created: savedToken.created,
        //     userId: savedToken.userId,
        //     user: foundUser
        // };

        // ("founduser",foundUser);
        //response.users = foundUser;
        // ("res.user",response.users);
        //("res",response);
        // ("savedToken", savedToken);
        //commonService.sendResponse(res,200,200,"User has signed in successfully",response);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(
          JSON.stringify({
            _id: savedToken._id,
            ttl: savedToken.ttl,
            created: savedToken.created,
            userId: savedToken.userId,
            user: userFound
          })
        );
        res.end();
      });
    }
  });
};

exports.signin = async function(req, res, next) {
  // Get posted request data for the user sign in.
  var user = {
    email: req.body.email.toLowerCase(),
    password: req.body.password
  };

  try {
    // Check user account using user service object.
    var userSignInChk = await userService.signin(user);
    var userData = await userService.chkSignIn(userSignInChk, req.body.password);
    if (userData.error == 0) {
      return res.status(200).json({
        status: 200,
        data: userData,
        message: 'User signed in successfully.',
        error: 0
      });
    } else {
      return res.status(200).json({
        status: 200,
        data: '',
        message: userData.msg,
        error: 1
      });
    }
  } catch (exception) {
    exception;
    // Return an error response with code and message.
    return res.status(500).json({
      status: 500,
      message: 'User sign in failed. Something went wrong.'
    });
  }
};

exports.verifyemail = async function(req, res, next) {
  try {
    if (req.params.token && req.params.token != undefined) {
      const data = await jwt.verify(req.params.token, constants.SECRET);
      const user = await User.findOne({ email: data.email });
      console.log('user......', req.params.token, data.email, user);
      if (!user) {
        return res.status(201).json({
          status: 201,
          data: 'already',
          message: "Sorry user doesn't exist",
          error: 1
        });
      } else {
        if (user.emailVerified == true) {
          return res.status(201).json({
            status: 201,
            data: 'already',
            message: 'This Email is already verified.',
            error: 1
          });
        } else {
          if (user.verificationToken == '') {
            return res.status(201).json({
              status: 201,
              data: 'failed',
              message: 'Verification Token Expired.',
              error: 1
            });
          } else {
            if (req.params.token != user.verificationToken) {
              return res.status(201).json({
                status: 201,
                data: 'failed',
                message: 'Email verification failed.',
                error: 1
              });
            } else {
              user.emailVerified = true;
              user.verificationToken = '';
              const result = await user.save();
              if (result)
                return res.status(201).json({
                  status: 201,
                  data: 'success',
                  message: 'Email verification successful.',
                  error: 0
                });
              else
                return res.status(201).json({
                  status: 201,
                  data: 'failed',
                  message: 'Email verification failed.',
                  error: 1
                });
            }
          }
        }
      }
    } else
      return res.status(201).json({
        status: 404,
        data: 'failed',
        message: 'Token not supplied',
        error: 1
      });
  } catch (exception) {
    // Return an error response with code and message.
    console.log('exception......', exception);
    return res.status(500).json({
      data: exception,
      status: 500,
      message: 'Email verification failed. Something went wrong.',
      error: 1
    });
  }
};

exports.forgotpwd = async function(req, res, next) {
  const reqEmail = req.body.email;
  try {
    const user1 = await User.findOne({ email: reqEmail });
    if (user1) {
      const resetPasswordToken = jwt.sign({ reqEmail }, constants.SECRET, { expiresIn: '1d' });
      user1.resetPasswordToken = resetPasswordToken;
      user1.isforgotPassword = true;
      const result = await user1.save();
      if (result) {
        let templateVariable = {
          templateURL: 'mailtemplate/forgotpassword',
          token: resetPasswordToken,
          fullName: user1.firstname + ' ' + user1.lastname,
          FRONT_BASE_URL: constants.ACCESSURL
        };
        let mailParamsObject = {
          templateVariable: templateVariable,
          to: req.body.email,
          subject: 'Reset Password Link'
        };
        mailer.sendMail(mailParamsObject, function(err) {
          if (err) return commonService.sendResponse(res, 201, 201, 'Mail not sent.', null);
          else return commonService.sendResponse(res, 200, 200, 'Mail sent successfully.', null);
        });
      } else return commonService.sendResponse(res, 500, 500, 'Unable to connect to database. Please try again later.', null);
    } else return commonService.sendResponse(res, 404, 404, 'Email not found, please enter existing one', null);
  } catch (exception) {
    console.log('Error  occurred...', exception);
    commonService.sendResponse(res, 404, 404, 'Something went wrong.', null);
  }
};
// Get posted request data for the user sign in.
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (user) {
//       if (user.emailVerified == true) {
//         userService.updateNewToken(user.id, function(err, updatedToken) {
//           if (updatedToken.response == true) {
//             userService.userData(user.id, function(er, userData) {
//               /******* mail code *******/
//               var templateVariable = {
//                 templateURL: 'mailtemplate/forgotpassword',
//                 token: updatedToken.token,
//                 fullName: userData.firstname + ' ' + userData.lastname,
//                 FRONT_BASE_URL: constants.ACCESSURL
//               };
//               var mailParamsObject = {
//                 templateVariable: templateVariable,
//                 to: req.body.email,
//                 subject: 'Forgot Password'
//               };
//               mailer.sendMail(mailParamsObject, function(err) {
//                 if (err) {
//                   return res.status(201).json({
//                     statusCode: 201,
//                     message: 'Mail not sent.'
//                   });
//                 } else {
//                   return res.status(200).json({
//                     statusCode: 200,

//                     message: 'Mail sent successfully.'
//                   });
//                 }
//               });
//             });
//           } else {
//             return res.status(201).json({
//               statusCode: 201,
//               message: 'Something went wrong.'
//             });
//           }
//         });
//       } else {
//         return res.status(201).json({
//           statusCode: 201,
//           message: 'Please first verify your email.'
//         });
//       }
//     } else {
//       return res.status(201).json({
//         statusCode: 201,
//         message: "This user doesn't exist, please enter existing user."
//       });
//     }
//   } catch (exception) {
//     // Return an error response with code and message.
//     return res.status(500).json({
//       statusCode: 500,
//       message: 'Something went wrong.'
//     });
//   }
// };

exports.resetpassword = async function(req, res, next) {
  try {
    if (req.params.token && req.params.token != undefined && req.body.password && req.body.password != undefined) {
      const token = jwt.verify(req.params.token, constants.SECRET);
      if (token) {
        const user1 = await User.findOne({ email: token.reqEmail });
        if (user1) {
          user1.passwordConfirm = req.body.password;
          const result = await user1.save();
          if (result) commonService.sendResponse(res, 200, 200, 'Password updated successfully.', null);
          else commonService.sendResponse(res, 500, 500, 'Something went wrong while connecting to database', null);
        } else commonService.sendResponse(res, 404, 404, 'User not Found', null);
      } else commonService.sendResponse(res, 401, 401, 'Token  not valid', null);
    } else commonService.sendResponse(res, 404, 404, 'Request Parameters Missing', null);
  } catch (err) {
    console.log('Error  occurred in reset password API...', err);
    commonService.sendResponse(res, 404, 404, 'Something went wrong.', null);
  }
};
//   var token = req.body.token;
//   var password = req.body.password;
//   try {
//     var checkToken = await userService.checkToken(token);
//     if (checkToken != null) {
//       // Create a new user account using user service object.
//       var updatePassword = await userService.updatePassword(token, password);
//       if (updatePassword.n == 1) {
//         return res.status(200).json({
//           status: 200,
//           data: 'success',
//           message: 'Password updated successfully.',
//           error: 0
//         });
//       } else {
//         return res.status(201).json({
//           status: 201,
//           data: 'failed',
//           message: 'Password not updated.',
//           error: 1
//         });
//       }
//     } else {
//       return res.status(201).json({
//         status: 201,
//         data: 'failed',
//         message: 'Invalid reset password token',
//         error: 1
//       });
//     }
//   } catch (exception) {
//     // Return an error response with code and message.
//     return res.status(500).json({
//       status: 500,
//       message: 'Password not updated. Something went wrong.',
//       error: 1
//     });
//   }
// };

exports.dashboard = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Dashboard',
    frontConstant: frontConstant,
    user: req.session.userLogin
  };
  res.render('index', renderParams);
};

exports.verifyEmail = async function(req, res, next) {
  var token = req.params.token;
  try {
    var checkToken = await userService.checkToken(token);
    if (checkToken != null) {
      // Create a new user account using user service object.
      var emailVerify = await userService.updateEmailVerify(token);
      if (emailVerify) {
        res.send('EMail Verified Successfully!!!!');
      } else {
        res.send('User Not found!!');
      }
    } else {
      res.send('Invalid Email verification token.');
    }
  } catch (exception) {
    // Return an error response with code and message.
    res.send('Email not verified. Something went wrong.');
  }
};

exports.getProfile = async function(req, res, next) {
  try {
    var userProfile = await User.findOne({ _id: req.authenticationId.userId });
    if (userProfile) {
      var userFound1 = userProfile.toObject();
      delete userFound1['wallets'];
      delete userFound1.password;
      delete userFound1.secretAccessKey;
      delete userFound1.passwordConfirm;
      delete userFound1.fcmToken;
      delete userFound1.otp;
      user = userFound1;
      userFound1.profilePicture != undefined
        ? (user.profilePicture = constants.ACCESSURL + 'uploads/profile_picture/' + userFound1.profilePicture)
        : (user.profilePicture = '');
      commonService.sendResponse(res, 200, 200, 'Profile Details', user);
    } else {
      commonService.sendResponse(res, 401, 401, 'User not Found');
    }
  } catch (exception) {
    // Return an error response with code and message.
    commonService.sendResponse(res, 500, 500, 'Something Went Wrong. Please try again.');
  }
};
exports.editProfile = async function(req, res, next) {
  if (req.file) {
    var userData = await User.findOne({ _id: req.authenticationId.userId }, function(err, userDetails) {
      if (userDetails && userDetails.profilePicture && fs.existsSync(req.file.destination + '/' + userDetails.profilePicture)) {
        fs.unlinkSync(req.file.destination + '/' + userDetails.profilePicture);
        userDetails.profilePicture;
      }
    });
  }
  console.log('Req.body....', req.body);
  var user = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    dob: req.body.dob,
    country: req.body.country,
    countryCode: req.body.countryCode,
    company: req.body.company,
    username: req.body.username,
    profilePicture: req.file ? req.file.filename : req.body.profilePicture
  };

  try {
    var userUpdateProfile = await userService.editUser(req, user);
    if (userUpdateProfile) {
      var userFound2 = userUpdateProfile.toObject();
      delete userFound2['wallets'];
      delete userFound2.password;
      delete userFound2.secretAccessKey;
      delete userFound2.passwordConfirm;
      delete userFound2.fcmToken;
      delete userFound2.otp;
      let user1 = userFound2;
      userFound2.profilePicture != undefined
        ? (user1.profilePicture = constants.ACCESSURL + 'uploads/profile_picture/' + userFound2.profilePicture)
        : (user1.profilePicture = '');
      commonService.sendResponse(res, 200, 200, 'Profile Updated Successfully', user1);
    } else {
      commonService.sendResponse(res, 401, 401, 'Profile not updated. Please try again.');
    }
  } catch (exception) {
    // Return an error response with code and message.
    commonService.sendResponse(res, 500, 500, 'Profile not updated. Something went wrong.');
  }
};
exports.getUserRewards = async function(req, res, next) {
  userService.getUserRewards(req, function(error, rewards) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'User Rewards', rewards);
    } else {
      commonService.sendResponse(res, 500, 500, 'Profile not updated. Something went wrong.');
    }
  });
};
exports.contactUs = async function(req, res, next) {
  userService.updateQuery(req.body, function(error, queries) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'Message Sent Successfully');
    } else {
      commonService.sendResponse(res, 500, 500, 'Something went wrong.');
    }
  });
};
exports.logout = function(req, res, next) {
  userService.logOut(req, function(error, objLogout) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'User Logged out successfully.');
    } else {
      commonService.sendResponse(res, 500, 500, 'Something went wrong.');
    }
  });
};
exports.verifyOtp = async function(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.authenticationId.userId });
    console.log('User........detais', user.firstname, user.otp, req.body.otp, parseInt(user.otp) == parseInt(req.body.otp));
    if (user) {
      if (parseInt(user.otp) == parseInt(req.body.otp)) {
        user.otp = '';
        const result = await user.save();
        if (result) {
          console.log('Yeah i am verified');
          return commonService.sendResponse(res, 200, 200, 'Otp Verified successfully.', null);
        } else return commonService.sendResponse(res, 500, 500, 'Error occurred while connecting to database', error);
      } else return commonService.sendResponse(res, 201, 201, 'Wrong OTP', null);
    } else return commonService.sendResponse(res, 404, 404, 'User not found', null);
  } catch (err) {
    console.log('Error occurred in verify OTP API..', err);
    commonService.sendResponse(res, 404, 404, 'Something went wrong', null);
  }
};
exports.sendOtp = function(req, res, next) {
  try {
    userService.sendOtp(req, function(error, sent) {
      if (!error) {
        commonService.sendResponse(res, 200, 200, 'OTP successfuly send on your number.', {});
      } else {
        commonService.sendResponse(res, 400, 400, 'Some error occured.', error);
      }
    });
  } catch (exception) {
    commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
  }
};

exports.addWalletAddress = async function(req, res, next) {
  var params = req.params;
  return res.status(200).json({
    statusCode: 200,
    message: 'Successfuly Added wallet address.'
  });
};
exports.updateFCMToken = function(req, res, next) {
  try {
    userService.addUpdateFCMToken(req, req.body, function(error, updateToken) {
      if (!error) {
        commonService.sendResponse(res, 200, 200, 'FCM Token Added Successfully.', {});
      } else {
        commonService.sendResponse(res, 400, 400, 'Some error occured.', error);
      }
    });
  } catch (exception) {
    commonService.sendResponse(res, 500, 500, 'Some error occured.', error);
  }
};
exports.sendNoti = function(req, res, next) {
  var payload = {
    _id: '123456456451',
    title: 'test noti',
    type: 'Transactional',
    message: 'Test Transactional Message',
    createdAt: '15565889',
    data: {
      txid: '12',
      txUrl: 'https://google.com'
    }
  };
  var token =
    'eOSCtlJxJT8:APA91bFhiver4MLHX6YVtTmVLzsGj-D5kl7eR-7QUtB-HzQiINSaDHBYCK_OYCCdhkANawkWzOtCaJqfbmNIoq0UwK6IoJooW_TMiQuC0NMlxp0M9QJYBQgi4uS_myLuA4tEZcNfqdqRFop40PG7BTX_XS5nNNVzZg';
  notification.sendNotificaiton(token, payload, function(err) {
    if (err) {
      res.send('failed');
    } else {
      res.send('successs');
    }
  });
};

exports.postKYCDocuments1 = async (req, res) => {
  let user = await User.findOne({ _id: req.authenticationId.userId });
  if (user) {
    user.kyc.isVerified = 0;
    user.kyc.country = req.body.country;
    user.kyc.state = req.body.state;
    user.kyc.city = req.body.city;
    user.kyc.firstname = req.body.firstname;
    user.kyc.lastname = req.body.lastname;
    user.kyc.email = req.body.email;
    user.kyc.countryCode = req.body.countryCode;
    user.kyc.phone = req.body.phone;
    user.kyc.dateOfBirth = req.body.dateOfBirth;
    user.kyc.countryCode = req.body.countryCode;
    user.kyc.time_unix = Math.floor(new Date().getTime() / 1000);
    const result = await user.save();
    if (result) {
      res.send({ status: 200, message: 'Data Saved Successfully' });
    } else res.send({ status: 400, message: 'Some Error occured while saving to database.Please try again later' });
  } else res.send({ status: 400, message: 'User Not Found' });
};

exports.postKYCDocuments2 = async (req, res) => {
  let docImage, docHoldingImage;
  if (req.files.docImage !== undefined && req.files.docHoldingImage !== undefined) {
    docImage = req.files['docImage'][0].filename;
    docHoldingImage = req.files['docHoldingImage'][0].filename;
    utilityBill = req.files.utilityBill ? req.files['utilityBill'][0].filename : '';
  } else return res.send({ status: 400, message: 'Please upload documents' });
  let user = await User.findOne({ _id: req.authenticationId.userId });
  if (user) {
    user.kyc.docID = req.body.docID;
    user.kyc.docImage = docImage;
    user.kyc.docHoldingImage = docHoldingImage;
    user.kyc.utilityBill = utilityBill;

    const result = await user.save();
    if (result) {
      res.send({ status: 200, message: 'Data Saved Successfully' });
    } else res.send({ status: 400, message: 'Some Error occured while saving to database.Please try again later' });
  } else res.send({ status: 400, message: 'User Not Found' });
};

exports.postKYCDocuments3 = async (req, res) => {
  let user = await User.findOne({ _id: req.authenticationId.userId });
  if (user) {
    user.kyc.isVerified = 1;
    const result = await user.save();
    if (result) {
      res.send({ status: 200, message: 'Data Saved Successfully' });
    } else res.send({ status: 400, message: 'Some Error occured while saving to database.Please try again later' });
  } else res.send({ status: 400, message: 'User Not Found' });
};

const kycReply = async memberId => {
  let data = {
    kycStatus: '',
    kycMessage: ''
  };
  const user = await User.findOne({ _id: memberId });
  if (user) {
    if (user.kyc && user.kyc.isVerified) {
      if (user.kyc.isVerified == 0) {
        data.kycStatus = 0;
        data.kycMessage = 'KYC Not Submitted';
        return data;
      } else if (user.kyc.isVerified == 1) {
        data.kycStatus = 1;
        data.kycMessage = 'KYC Under Review';
        return data;
      } else if (user.kyc.isVerified == 2) {
        data.kycStatus = 2;
        data.kycMessage = 'KYC Verified';
        return data;
      } else if (user.kyc.isVerified == 3) {
        data.kycStatus = 3;
        data.kycMessage = 'KYC Verification Failed';
        return data;
      } else {
        data.kycStatus = 0;
        data.kycMessage = 'KYC Not Submitted';
        return data;
      }
    } else {
      data.kycStatus = 0;
      data.kycMessage = 'KYC Not Submitted';
      return data;
    }
  } else {
    data.kycStatus = 0;
    data.kycMessage = 'KYC Not Submitted';
    return data;
  }
};
exports.getKYCDocuments = async (req, res) => {
  let user = await User.findOne({ _id: req.authenticationId.userId });
  if (user) {
    const kycMessage = await kycReply(user._id);
    user.kyc.kycStatus = kycMessage ? kycMessage.kycMessage : 'KYC Not Submitted';
    res.send({ status: 200, data: user.kyc });
  } else res.send({ status: 400, message: 'User Not Found' });
};

exports.getReferralDetails = async (req, res) => {
  const data = await userService.referralData(req.authenticationId.userId);
  if (data) res.send({ status: 200, data: data });
  else res.send({ status: 400, message: 'User Not Found' });
};

exports.getcountryList = async (req, res) => {
  let country = countries.getData();
  res.send({
    status: 200,
    message: 'country-List!!',
    error: 0,
    data: country
  });
};

exports.getStateList = async (req, res) => {
  let country = req.body.countryName;
  let stateList = await yourhandle.getStatesByShort(country);
  console.log("stateList", stateList);
  if(stateList.length > 0){
  res.send({
    status: 200,
    message: 'State-List!!',
    error: 0,
    data: stateList
  });
}
else if(stateList.length == 0){
  stateList.push(country);
  res.send({
    status: 200,
    message: 'State-List!!',
    error: 0,
    data: stateList
  });
}
};

exports.getCityList = async (req, res) => {
  let country = req.body.countryName;
  let state = req.body.stateName;
  let cityList = await yourhandle.getCities(country, state);
  if(cityList.length > 0){
  res.send({
    status: 200,
    message: 'City-List!!',
    error: 0,
    data: cityList
  });
}
else if (cityList.length == 0){
  cityList.push(state);
  res.send({
    status: 200,
    message: 'City-List!!',
    error: 0,
    data: cityList
  });
}
};

exports.getRates = async (req, res) => {
  try {
    let result = {
      etherRate: '',
      bitcoinRate: '',
      dollarRate: '',
      totalcoin: ''
    };
    if (req.body.tokens && req.body.tokens != undefined) {
      const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS);
      const currentRound = await contract.methods.currentStage().call();
      if (currentRound >= 0 && currentRound <= 2) {
        const round = await contract.methods.rounds(currentRound).call();
        const currentRoundRateInCents = round.rate;
        const amount = currentRoundRateInCents * req.body.tokens;

        let ethToUsd = await commonService.getETHToUSD();
        const usdToEth = amount / (ethToUsd * 100);
        let btcToUsd = await commonService.getBTCToUSD();
        const usdToBtc = amount / (btcToUsd * 100);

        result = {
          etherRate: usdToEth,
          bitcoinRate: usdToBtc,
          dollarRate: currentRoundRateInCents / 100,
          totalcoin: req.body.tokens / usdToEth
        };
        commonService.sendResponse(res, 200, 200, 'Rates displayed Successfully', result);
      } else commonService.sendResponse(res, 400, 400, 'Sale is not ON.', result);
    } else commonService.sendResponse(res, 400, 400, 'Req parameter Missing', result);
  } catch (err) {
    console.log('Error Occured in getRates API......', err);
    commonService.sendResponse(res, 400, 400, 'Some error occurred. Please try again later', result);
  }
};

exports.getTACBalance = async (req, res) => {
  // req.authenticationId = {
  //   userId : '5dfc739a2fd6c002a797b8de'
  // }
  try {
    let result = {
      TACBalance: '',
      defaultAddress: '',
      etherBalance: ''
    };
    const wallet = await Wallet.findOne({ memberId: req.authenticationId.userId, defaultAddress: true });
    if (wallet) {
      const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS);
      let tokenBalance = await contract.methods.balanceOf(wallet.walletAddress).call();
      let etherBalance = await web3.eth.getBalance(wallet.walletAddress);
      result = {
        TACBalance: (tokenBalance / 10 ** 18).toFixed(8),
        defaultAddress: wallet.walletAddress,
        etherBalance: etherBalance
      };
      commonService.sendResponse(res, 200, 200, 'Displayed Successfully', result);
    } else commonService.sendResponse(res, 400, 400, 'Wallet Not Found', result);
  } catch (err) {
    console.log('Error occurred in Get TAC Balance API', err);
    commonService.sendResponse(res, 400, 400, 'Some Error occurred', err);
  }
};
