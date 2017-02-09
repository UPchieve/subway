var config = require('../config/server');

var transporter = require('nodemailer').createTransport(config.mail.auth);

module.exports = {
  sendVerification: function(options, callback){
    var email = options.email,
        token = options.token;

    var mailOptions = {
      to: email,
      from: config.mail.senders.noreply,
      subject: 'Verify your account',
      text: [
        'Please verify your account:',
        'http://' + config.client.host + '/#/action/verify/' + token
      ].join('\n\n')
    };

    transporter.sendMail(mailOptions, callback);
  }
};
