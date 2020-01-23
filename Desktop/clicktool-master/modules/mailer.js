let nodemailer = require('nodemailer');
let constants = require('../modules/constants');
let fs = require('fs');
let handlebars = require('handlebars');
let appRoot = require('app-root-path');

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: constants.MAIL_HOST,
  port: constants.MAIL_PORT,
  auth: {
    user: constants.MAIL_FROM_AUTH,
    pass: constants.MAIL_PASSWORD
  },
  tls: { rejectUnauthorized: false },
  debug: true
});

exports.sendMail = (mailParamsObject, callback) => {
  console.log("mail object...", mailParamsObject);
  let path = appRoot + '/views/' + mailParamsObject.templateVariable.templateURL + '.handlebars';
  let html = fs.readFileSync(path, { encoding: 'utf-8' });
  if (html) {
    console.log("html...", html);
    let template = handlebars.compile(html);
    let htmlToSend = template(mailParamsObject.templateVariable);
    let mailOptions = {
      from: 'info@abundance.com',
      to: mailParamsObject.to,
      subject: mailParamsObject.subject,
      html: htmlToSend
    };
    transporter.sendMail(mailOptions, function(error, response) {
      console.log("error.....",error,  response);
      if (error) callback(error, null);
      else callback(null, response);
    });
  }
};
