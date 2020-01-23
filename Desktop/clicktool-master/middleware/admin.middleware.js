let jwt = require('jsonwebtoken');
let config = require('../modules/constants');
const Admin = require('../models/Admin');

// exports.authenticate = (req, res, next) => {

//       let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
//       if (token && token.startsWith('Bearer ')) {
//         // Remove Bearer from string
//         token = token.slice(7, token.length);
//       }

//       if (token) {
//         jwt.verify(token, config.SECRET, (err, decoded) => {
//           if (err) {
//             return res.status(500).json({
//               auth: false,
//               message: 'Token is not valid'
//             });
//           } else {
//             req.userId = decoded.id;
//             next();
//           }
//         });
//       } else {
//         return res.status(401).json({
//           auth: false,
//           message: 'Auth token is not supplied'
//         });
//       }
// }

exports.authenticate = async function(req, res, next) {
  if (req.session.adminLogin) {
    Admin.findOne({ _id: req.session.adminLogin.userId }, function(err, user) {
      if (user) {
        if (user.profilePicture) {
          req.session.adminLogin.profilePicture = user.profilePicture;
          req.authenticationId = req.session.adminLogin;
          next();
        } else {
          req.session.adminLogin.profilePicture = '';
          req.authenticationId = req.session.adminLogin;
          next();
        }
      }
    });
  } else {
    res.redirect('/admin');
  }
};
