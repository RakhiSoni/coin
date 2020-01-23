// Access user service.
const userService = require('../services/user.service');
const user = require('../models/Member');
const constants = require('../modules/constants');
var mailer = require('../modules/mailer');
const truffle_connect = require('../connection/app.js');
var handlebarhelpers = require('../modules/handlebarhelpers');
var countries = require('country-list')();
const commonService = require('../services/common.service');
const { abi } = require('../contractConfig/abi');
const Web3 = require('web3');
const provider = 'https://ropsten.infura.io/v3/5cfea0d474d94d178f030574a25eee02';
const web3 = new Web3(provider);
const jwt = require('jsonwebtoken');

exports.signup = async function(req, res, next) {
  if (req.body.password != req.body.c_password) {
    return res.status(201).json({
      status: 201,
      data: '',
      message: 'Password and Confirm password must match',
      error: 1
    });
  }
  var user_wallet = [];
  try {
    // Get posted request data for the user sign up.
    var user = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      dob: req.body.dob,
      country: req.body.country,
      countryCode: req.body.countryCode,
      company: req.body.company,
      username: req.body.username,
      profilePicture: req.body.profilePicture
    };
    var token = '';
    // Create a new user account using user service object.
    var createdUser = await userService.signup(user);
    if (createdUser != null) {
      token = createdUser.verificationToken;
      const request = {
        authenticationId: {
          userId: createdUser._id
        }
      };
      truffle_connect.createHDWallet(request, function(wallet) {
        user_wallet = wallet;
      });
    }
    /******* mail code *******/
    var templateVariable = {
      templateURL: 'mailtemplate/registration',
      fullName: req.body.firstName + ' ' + req.body.lastName,
      token: token,
      FRONT_BASE_URL: constants.ACCESSURL
    };
    console.log('template.............', templateVariable);
    var mailParamsObject = {
      templateVariable: templateVariable,
      to: req.body.email,
      subject: 'Registration Successful.'
    };
    console.log('mailParamsObject.............', mailParamsObject);
    obj = {};
    var sessData = req.session;
    obj.id = user.id;
    obj.email = user.email;
    obj.name = user.name;
    obj.emailVerified = user.emailVerified;
    obj.isActive = user.isActive;
    obj.privateKey = user_wallet.privateKey;
    sessData.userLogin = obj;
    mailer.sendMail(mailParamsObject, function(err, response) {
      if (err) {
        return res.status(201).json({
          status: 201,
          data: err,
          message: 'Mail sending failed.',
          error: 1
        });
      } else {
        return res.status(201).json({
          status: 201,
          data: createdUser,
          privatekey: user_wallet.privateKey,
          message: 'User signed up successfully.',
          error: 0
        });
      }
    });
    /******** mail code *******/
  } catch (exception) {
    exception;
    // Return an error response with code and message.
    return res.status(500).json({
      status: 500,
      message: 'User sign up failed. Something went wrong.',
      error: 1
    });
  }
};

exports.signin = async function(req, res, next) {
  var obj = {};
  var sessData = req.session;
  sessData.userLogin = req.body;
  return res.status(200).json({
    status: 200,
    data: req.session.userLogin,
    message: 'User signed in successfully.',
    error: 0
  });
  // Get posted request data for the user sign in.
  //    var user = {
  //        email: req.body.email.toLowerCase(),
  //        password: req.body.password
  //    };
  //    try {

  //    const login_req = new (require('curl-request'))();
  //    curl.setHeaders([
  //        'Content-Type: application/json',
  //        'Accept: application/json'
  //    ]).setBody(user)
  //            .post(constants.API_URL + 'Members/login')
  //            .then(({statusCode, body, headers}) => {
  //                (statusCode, body, headers)
  //            })
  //            .catch((e) => {
  //                (e);
  //            });
  // Check user account using user service object.
  //        var userSignInChk = await userService.signin(user);
  //        var userData = await userService.chkSignIn(userSignInChk, req.body.password);
  //        if (userData.error == 0) {
  //            return res.status(200)
  //                    .json({
  //                        status: 200,
  //                        data: userData,
  //                        message: "User signed in successfully.",
  //                        error: 0
  //                    });
  //        } else {
  //            return res.status(200)
  //                    .json({
  //                        status: 200,
  //                        data: "",
  //                        message: userData.msg,
  //                        error: 1
  //                    });
  //        }
  //    } catch (exception) {
  //        (exception);
  //        // Return an error response with code and message.
  //        return res.status(500)
  //                .json({
  //                    status: 500,
  //                    message: "User sign in failed. Something went wrong."
  //                });
  //    }
};

exports.verifyEmail = async function(req, res, next) {
  try {
    let renderParams = {
      layout: 'blank',
      title: 'mail-verification',
      constants: constants
    };
    console.log('Nisha..............', req.params, await jwt.verify(req.params.token, constants.SECRET));

    if (req.params.token && req.params.token != undefined) {
      const data = await jwt.verify(req.params.token, constants.SECRET);
      const user1 = await user.findOne({ email: data.email });
      renderParams.firstname = user1.firstname;
      renderParams.lastname = user1.lastname;
      if (!user1) {
        renderParams.message = "Sorry user doesn't exist";
        renderParams.status = 1;
        res.render('mail_verification', renderParams);
        // return res.status(201).json({
        //   status: 201,
        //   data: 'already',
        //   message: "Sorry user doesn't exist",
        //   error: 1
        // });
      } else {
        if (user1.emailVerified == true) {
          renderParams.message = 'This Email is already verified.';
          renderParams.status = 0;
          res.render('mail_verification', renderParams);
          // return res.status(201).json({
          //   status: 201,
          //   data: 'already',
          //   message: 'This Email is already verified.',
          //   error: 1
          // });
        } else {
          if (user1.verificationToken == '') {
            renderParams.message = 'Verification Token Expired.';
            renderParams.status = 1;
            res.render('mail_verification', renderParams);
            // return res.status(201).json({
            //   status: 201,
            //   data: 'failed',
            //   message: 'Verification Token Expired.',
            //   error: 1
            // });
          } else {
            console.log('Nisha..............', req.params.token, user1.verificationToken, req.params.token == user1.verificationToken);
            if (req.params.token != user1.verificationToken) {
              renderParams.message = 'Email verification failed.';
              renderParams.status = 1;
              res.render('mail_verification', renderParams);
              // return res.status(201).json({
              //   status: 201,
              //   data: 'failed',
              //   message: 'Email verification failed.',
              //   error: 1
              // });
            } else {
              user1.emailVerified = true;
              user1.verificationToken = '';
              const result = await user1.save();
              if (result) {
                renderParams.message = 'Email verification successful.';
                renderParams.status = 0;
                res.render('mail_verification', renderParams);
                // return res.status(201).json({
                //   status: 201,
                //   data: 'success',
                //   message: 'Email verification successful.',
                //   error: 0
                // });
              } else {
                renderParams.message = 'Email verification failed.';
                renderParams.status = 1;
                res.render('mail_verification', renderParams);
              }
              // return res.status(201).json({
              //   status: 201,
              //   data: 'failed',
              //   message: 'Email verification failed.',
              //   error: 1
              // });
            }
          }
        }
      }
    } else {
      let renderParamsErr = {
        layout: 'blank',
        title: 'error',
        constants: constants
        // admin: req.session.adminLogin
      };
      res.render('error', renderParamsErr);
    }
  } catch (exception) {
    // Return an error response with code and message.
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      constants: constants
      // admin: req.session.adminLogin
    };
    res.render('error', renderParamsErr);
  }
};

// exports.verifyemail = async function(req, res, next) {
//   try {
//     if (req.query.token && req.query.token != undefined){
//     const data = await jwt.verify(req.params.token, constants.SECRET);
//     const user = await User.findOne({ email: data.email });

//     if (!user) {
//       return res.status(201).json({
//         status: 201,
//         data: 'already',
//         message: "Sorry user doesn't exist",
//         error: 1
//       });
//     } else {
//       if (user.isVerified == true) {
//         return res.status(201).json({
//           status: 201,
//           data: 'already',
//           message: 'This Email is already verified.',
//           error: 1
//         });
//       } else {
//         if (user.emailVerificationToken == '') {
//           return res.status(201).json({
//             status: 201,
//             data: 'failed',
//             message: 'Verification Token Expired.',
//             error: 1
//           });
//         } else {
//           if (query.token != user.emailVerificationToken) {
//             return res.status(201).json({
//               status: 201,
//               data: 'failed',
//               message: 'Email verification failed.',
//               error: 1
//             });
//           } else {
//             user.isVerified = true;
//             user.emailVerificationToken = '';
//             const result = await user.save();
//             if (result)
//               return res.status(201).json({
//                 status: 201,
//                 data: 'success',
//                 message: 'Email verification successful.',
//                 error: 0
//               });
//             else
//               return res.status(201).json({
//                 status: 201,
//                 data: 'failed',
//                 message: 'Email verification failed.',
//                 error: 1
//               });
//           }
//         }
//       }
//     }
//   } else return res.status(201).json({
//     status: 201,
//     data: 'failed',
//     message: 'Token not supplied',
//     error: 1
//   });
//   } catch (exception) {
//     // Return an error response with code and message.
//     return res.status(500).json({
//       data: exception,
//       status: 500,
//       message: 'Email verification failed. Something went wrong.',
//       error: 1
//     });
//   }
// };

exports.forgotPassword = async (req, res) => {
  const reqEmail = req.body.email;
  try {
    const user1 = await user.findOne({ email: reqEmail });
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

exports.reset_Password = async function(req, res, next) {
  let token = req.params.token;
  try {
    let checkToken = await userService.checkToken(token);
    if (checkToken != null && checkToken.isforgotPassword == true) {
      let renderParams = {
        layout: 'login',
        title: 'Reset Password',
        constants: constants,
        token: token
      };
      res.render('reset_password', renderParams);
    } else {
      let renderParamsErr = {
        layout: 'blank',
        title: 'error',
        constants: constants
      };
      res.render('error', renderParamsErr);
    }
  } catch (exception) {
    // Return an error response with code and message.
    let renderParamsErr = {
      layout: 'blank',
      title: 'error',
      constants: constants
      // admin: req.session.adminLogin
    };
    res.render('error', renderParamsErr);
  }
};

exports.resetpassword = async function(req, res, next) {
  try {
    if (req.body.token && req.body.token != undefined && req.body.password && req.body.password != undefined) {
      const token = jwt.verify(req.body.token, constants.SECRET);
      if (token) {
        const user1 = await user.findOne({ email: token.reqEmail });
        if (user1) {
          user1.passwordConfirm = req.body.password;
          user1.isforgotPassword = false;
          const result = await user1.save();
          if (result) commonService.sendResponse(res, 200, 200, 'Password updated successfully.', null);
          else commonService.sendResponse(res, 500, 500, 'Something went wrong while connecting to database', null);
        } else commonService.sendResponse(res, 404, 404, 'User not Found', null);
      } else commonService.sendResponse(res, 401, 401, 'Token  not valid', null);
    } else commonService.sendResponse(res, 404, 404, 'Request Parameters Missing', null);
  } catch (err) {
    commonService.sendResponse(res, 404, 404, 'Something went wrong.', null);
  }
};

// exports.resetPassword = async function(req, res, next) {
//   try {
//     if (req.params.token && req.params.token != undefined && req.body.password && req.body.password != undefined) {
//       const token = jwt.verify(req.params.token, constants.SECRET);
//       if (token) {
//         console.log('email....', req.params.token, token);
//         const user1 = await user.findOne({ email: token.reqEmail });
//         if (user1) {
//           user1.password = req.body.password;
//           const result = await user1.save();
//           if (result) commonService.sendResponse(res, 200, 200, 'Password updated successfully.', null);
//           else commonService.sendResponse(res, 500, 500, 'Something went wrong while connecting to database', null);
//         } else commonService.sendResponse(res, 404, 404, 'User not Found', null);
//       } else commonService.sendResponse(res, 401, 401, 'Token  not valid', null);
//     } else commonService.sendResponse(res, 404, 404, 'Request Parameters Missing', null);
//   } catch (err) {
//     console.log('Error  occurred in reset password API...', err);
//     commonService.sendResponse(res, 404, 404, 'Something went wrong.', null);
//   }
// };
//   var token = req.params.token;
//   try {
//     // Create a new user account using user service object.
//     var checkToken = await userService.checkToken(token);
//     //var updateToken = await userService.updateToken(checkToken);

//     if (checkToken != null) {
//       if (checkToken.emailVerified == true) {
//         return res.status(201).json({
//           status: 201,
//           data: 'already',
//           message: 'This Email is already verified.',
//           error: 1
//         });
//       } else {
//         var updateToken = await userService.updateUserToken(checkToken._id);
//         if (updateToken.n == 1) {
//           return res.status(201).json({
//             status: 201,
//             data: 'success',
//             message: 'Email verification successful.',
//             error: 0
//           });
//         } else {
//           return res.status(201).json({
//             status: 201,
//             data: 'failed',
//             message: 'Email verification failed.',
//             error: 1
//           });
//         }
//       }
//     } else {
//       return res.status(201).json({
//         status: 201,
//         data: 'failed',
//         message: 'Invalid email verification token.',
//         error: 1
//       });
//     }
//   } catch (exception) {
//     // Return an error response with code and message.
//     return res.status(500).json({
//       data: exception,
//       status: 500,
//       message: 'Email verification failed. Something went wrong.',
//       error: 1
//     });
//   }
// };

// Get posted request data for the user sign in.
// var email = req.body.email;
// try {
//   userService.forgotpwd(email, function(error, emailChk) {
//     if (!error) {
//       if (emailChk.emailVerified === true) {
//         userService.updateNewToken(emailChk.id, function(err, updatedToken) {
//           if (updatedToken.response == 1) {
//             userService.userData(emailChk.id, function(er, userData) {
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
//                     status: 201,
//                     data: 'failed',
//                     message: 'Mail not sent.',
//                     error: 1
//                   });
//                 } else {
//                   return res.status(200).json({
//                     status: 200,
//                     data: 'success',
//                     message: 'Mail sent successfully.',
//                     error: 0
//                   });
//                 }
//               });
//             });
//           } else {
//             return res.status(201).json({
//               status: 201,
//               data: 'failed',
//               message: 'Something went wrong.',
//               error: 1
//             });
//           }
//         });
//       } else {
//         return res.status(201).json({
//           status: 201,
//           data: 'failed',
//           message: 'Please first verify your email.',
//           error: 1
//         });
//       }
//     } else {
//       return res.status(201).json({
//         status: 201,
//         data: 'failed',
//         message: "This user doesn't exist, please enter existing user.",
//         error: 1
//       });
//     }
//   });
// } catch (exception) {
//   // Return an error response with code and message.
//   return res.status(500).json({
//     status: 500,
//     message: 'User sign in failed. Something went wrong.',
//     error: 1
//   });
// }
// };

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
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  // waterfall(
  //   [
  //     function(callbackfunction1) {
  //       walletService.getDashboardDetails(req, req.body, function(error, wallets) {
  //         if (!error && wallets) {
  //           renderParams.dashboard = wallets;
  //           callbackfunction1(null, wallets);
  //         }
  //       });
  //     },
  //     function(wallets, callbackfunction2) {
  //       transaction
  //         .find({ $or: [{ to: wallets.defaultWallet.walletAddress }, { from: wallets.defaultWallet.walletAddress }] })
  //         .sort('-date')
  //         .exec(function(error, transactions) {
  //           if (transactions.length > 0) {
  //             renderParams.transactions = arraySort(transactions, 'date', { reverse: true });
  //             callbackfunction2(null, {});
  //           } else {
  //             renderParams.transactions = arraySort(transactions, 'date', { reverse: true });
  //             callbackfunction2(null, {});
  //           }
  //         });
  //     }
  //   ],
  //   function(error, arrResult) {
  //     renderParams;
  //     res.render('index', renderParams);
  //   }
  // );
};

// exports.verifyEmail = async function(req, res, next) {
//   var token = req.params.token;
//   try {
//     var checkToken = await userService.checkToken(token);
//     if (checkToken != null) {
//       // Create a new user account using user service object.
//       var emailVerify = await userService.updateEmailVerify(token);
//       if (emailVerify) {
//         res.send('EMail Verified Successfully!!!!');
//       } else {
//         res.send('User Not found!!');
//       }
//     } else {
//       res.send('Invalid Email verification token.');
//     }
//   } catch (exception) {
//     // Return an error response with code and message.
//     res.send('Email not verified. Something went wrong.');
//   }
// };

// exports.resetPassword = async function(req, res, next) {
//   var token = req.params.token;
//   try {
//     var checkToken = await userService.checkToken(token);
//     if (checkToken != null) {
//       var renderParams = {
//         layout: 'login',
//         title: 'Reset Password',
//         constants: constants,
//         token: token
//       };
//       res.render('reset_password', renderParams);
//     } else {
//       res.send('Invalid Password verification token.');
//     }
//   } catch (exception) {
//     // Return an error response with code and message.
//     res.send('Password cannot reset. Something went wrong.');
//   }
// };

exports.helpAndSupport = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Help And Support',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  res.render('helpAndSupport', renderParams);
};

exports.aboutUs = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'About Us',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  res.render('aboutUs', renderParams);
};

exports.getProfile = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'Edit Profile',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers,
    country: countries.getData()
  };
  user.findOne({ _id: req.session.userLogin.userId }, function(error, userdetails) {
    if (!error) {
      renderParams.userdetails = userdetails;
    }
    res.render('profile', renderParams);
  });
};

exports.kycverification1 = async function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'kyc request',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers,
    country: countries.getData()
  };
  let result = await user.findOne({ _id: req.authenticationId.userId });
  renderParams.result = result.kyc;
  if (user) res.render('kyc-verification-step-1', renderParams);
  else res.render('/');
};

exports.kycverification2 = async function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'kyc request',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  let result = await user.findOne({ _id: req.authenticationId.userId });
  renderParams.result = result.kyc;
  if (result) res.render('kyc-verification-step-2', renderParams);
  else res.render('/');
};

exports.kycverification3 = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'kyc request',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  res.render('kyc-verification-step-3', renderParams);
};

exports.kycUnderReview = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'kyc request',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  res.render('kyc-under-review', renderParams);
};

exports.kycVerificationFailed = async function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'kyc request',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  let result = await user.findOne({ _id: req.authenticationId.userId });
  renderParams.result = result.kyc.failReason;
  res.render('kyc-verification-failed', renderParams);
};

exports.kycverification = function(req, res, next) {
  var renderParams = {
    layout: 'main',
    title: 'kyc request',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  res.render('kyc-verification', renderParams);
};

const kycReply = async memberId => {
  let data = {
    kycStatus: '',
    kycMessage: ''
  };
  const user1 = await user.findOne({ _id: memberId });
  if (user1) {
    if (user1.kyc && user1.kyc.isVerified) {
      if (user1.kyc.isVerified == 0) {
        data.kycStatus = 0;
        data.kycMessage = 'KYC Not Submitted';
        return data;
      } else if (user1.kyc.isVerified == 1) {
        data.kycStatus = 1;
        data.kycMessage = 'KYC Under Review';
        return data;
      } else if (user1.kyc.isVerified == 2) {
        data.kycStatus = 2;
        data.kycMessage = 'KYC Verified';
        return data;
      } else if (user1.kyc.isVerified == 3) {
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

exports.getNewdashboard = async (req, res) => {
  try {
    const kycMessage = await kycReply(req.authenticationId.userId);
    var renderParams = {
      layout: 'main',
      title: 'Dashboard',
      constants: constants,
      user: req.session.userLogin,
      handlebarhelpers: handlebarhelpers
    };
    const contract = new web3.eth.Contract(abi, constants.ABUNDANCE_CONTRACT_ADDRESS);
    if (contract) {
      const currentRound = await contract.methods.currentStage().call();
      const rounds = [];
      rounds[0] = await contract.methods.rounds(0).call();
      rounds[1] = await contract.methods.rounds(1).call();
      rounds[2] = await contract.methods.rounds(2).call();
      let result = {
        activeRound: '',
        activeRoundName: '',
        activeRoundDate: '',
        activeRoundRate: '',
        todayRate: {},
        headline: '',
        futureDate: '',
        round1: rounds[0].name,
        round2: rounds[1].name,
        round3: rounds[2].name,
        rate1: rounds[0].rate / 100,
        rate2: rounds[1].rate / 100,
        rate3: rounds[2].rate / 100,
        dateRange1: `${new Date(rounds[0].startDate * 1000).toDateString()} - ${new Date(rounds[0].endDate * 1000).toDateString()}`,
        dateRange2: `${new Date(rounds[1].startDate * 1000).toDateString()} - ${new Date(rounds[1].endDate * 1000).toDateString()}`,
        dateRange3: `${new Date(rounds[2].startDate * 1000).toDateString()} - ${new Date(rounds[2].endDate * 1000).toDateString()}`,
        kycMessage: kycMessage ? kycMessage.kycMessage : 'KYC Not Submitted',
        kycStatus: kycMessage ? kycMessage.kycStatus : 0
      };

      if (currentRound == 0 || currentRound == 1 || currentRound == 2) {
        const currentRoundRateInCents = rounds[currentRound].rate;
        let ethToUsd = await commonService.getETHToUSD();
        const usdToEth = currentRoundRateInCents / (ethToUsd * 100);
        let btcToUsd = await commonService.getBTCToUSD();
        const usdToBtc = currentRoundRateInCents / (btcToUsd * 100);

        result.activeRound = parseInt(currentRound) + 1;
        result.activeRoundName = rounds[currentRound].name;
        result.activeRoundDate = `${new Date(rounds[currentRound].startDate * 1000).toDateString()} - ${new Date(
          rounds[currentRound].endDate * 1000
        ).toDateString()}`;
        result.activeRoundRate = rounds[currentRound].rate / 100;
        result.todayRate = {
          bitcoinRate: commonService.convertExponentialToDecimal(usdToBtc),
          etherRate: commonService.convertExponentialToDecimal(usdToEth),
          dollarRate: currentRoundRateInCents / 100
        };
        result.headline = `${rounds[currentRound].name} Ends In`;
        result.futureDate = new Date(rounds[currentRound].endDate * 1000);
        // res.send(result);
        renderParams.result = result;
        res.render('index', renderParams);
      } else if (currentRound == 4) {
        if (rounds[0].startDate < new Date().getTime / 1000) {
          result.headline = 'Presale Round 1 Starts In ';
          result.futureDate = new Date(rounds[0].startDate * 1000);
          // res.send(result);
          renderParams.result = result;
          res.render('index', renderParams);
        } else {
          result.headline = 'Sale Ended';

          // res.send(result);
          renderParams.result = result;
          res.render('index', renderParams);
        }
      } else {
        const now = Math.floor(new Date().getTime() / 1000);
        if (now > rounds[0].endDate() && now < rounds[1].startDate) {
          result.headline = `Presale Round 2 Starts In`;
          result.futureDate = new Date(rounds[1].startDate * 1000);
          // res.send(result);
          renderParams.result = result;
          res.render('index', renderParams);
        } else {
          result.headline = `Crowdsale Starts In`;
          // res.send(result);
          renderParams.result = result;
          res.render('index', renderParams);
        }
      }
    } else res.send({ message: 'An Error Occured' });
  } catch (err) {
    let renderParams = {
      layout: 'blank',
      title: 'error',
      constants: constants
      // user: req.session.userLogin,
    };
    res.render('error', renderParams);
  }
};

exports.getKycStatus = async (req, res) => {
  user.findOne({ _id: req.session.userLogin.userId }, function(error, userdetails) {
    if (!error) {
      const status = userdetails.kyc.isVerified;
      return res.send({ status: 200, message: status });
    }
    return res.send({ status: 400, message: 'Error' });
  });
};
