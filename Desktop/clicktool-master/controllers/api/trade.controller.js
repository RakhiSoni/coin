// Access user service.
const userService = require('../../services/user.service');
const tradeService = require('../../services/trade.service');
const constants = require('../../modules/constants');
var mailer = require('../../modules/mailer');
const truffle_connect = require('../../connection/app.js');
var frontConstant = require('../../modules/front_constant');
var commonService = require('../../services/common.service');

// exports.buyTokens = async function (req, res, next) {
//     var params = req.params;
//     return res.status(200)
//             .json({
//                 "statusCode": 200,
//                 "message": "Token Purchased Successfull. "
//             });
// };

exports.getStatements = function(req, res, next) {
  tradeService.getStatements(req, req.body, function(error, statement) {
    if (!error) {
      commonService.sendResponse(res, 200, 200, 'List of Statements', statement);
    } else {
      commonService.sendResponse(res, 401, 401, 'Soemthing went Wrong', error);
    }
  });
};

exports.downloadStatements = function(req, res, next) {
  console.log("I am here");
  var params = req.params;

  tradeService.downloadStatements(req, req.body, function(err, objStatement) {
    if (!err) {
      commonService.sendResponse(res, 200, 200, 'Statement Downloaded', { url: objStatement });
    } else if (err == 'no_data_found') {
      commonService.sendResponse(res, 404, 404, 'No Data Found');
    } else {
      commonService.sendResponse(res, 500, 500, 'Soemthing went Wrong', err);
    }
  });
  // return res.status(200)
  //         .json({
  //             "statusCode": 200,
  //             "message": "Success",
  //             "downloadLinkPdf": "http://www.pdf995.com/samples/pdf.pdf",
  //             "downloadLinkXls": "http://www.pdf995.com/samples/pdf.pdf"
  //         });
};
