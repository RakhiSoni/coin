// Access user service.
const userService = require('../services/user.service');
const tradeService = require('../services/trade.service');
const constants = require('../modules/constants');
var mailer = require('../modules/mailer');
var handlebarhelpers = require('../modules/handlebarhelpers');
const truffle_connect = require('../connection/app.js');
var frontConstant = require('../modules/front_constant');
var commonService = require('../services/common.service');

// exports.buyTokens = async function (req, res, next) {
//     var params = req.params;
//     return res.status(200)
//             .json({
//                 "statusCode": 200,
//                 "message": "Token Purchased Successfull. "
//             });
// };

exports.getStatements = function(req, res, next) {
  if (req.query.type == 'B') {
    req.body.statement_type = 'B';
  } else if (req.query.type == 'E') {
    req.body.statement_type = 'E';
  } else if (req.query.type == 'T') {
    req.body.statement_type = 'T';
  } else {
    req.body.statement_type = 'T';
  }
  req.body.type = 'A';
  var renderParams = {
    layout: 'main',
    title: 'Statements',
    constants: constants,
    user: req.session.userLogin,
    handlebarhelpers: handlebarhelpers
  };
  tradeService.getStatements(req, req.body, function(error, statement) {
    if (!error) {
      renderParams.statement = statement;
      renderParams.type = req.body.statement_type;
    }
    statement == null ? (renderParams.statement = '') : renderParams.statement;
    renderParams.type = req.body.statement_type;
    res.render('statements', renderParams);
  });
};

exports.downloadStatements = function(req, res, next) {
  tradeService.downloadStatements(req, req.body, function(err, objStatement) {
    if (!err) {
      commonService.sendResponse(res, 200, 200, 'Statement Download in progress', { url: objStatement });
    } else if (err == 'no_data_found') {
      commonService.sendResponse(res, 201, 201, 'No Data Found');
    } else {
      commonService.sendResponse(res, 201, 201, 'Soemthing went Wrong', err);
    }
  });
};
