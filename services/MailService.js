var config = require('../config');

var transporter = require('nodemailer').createTransport(config.mail.smtpConfig);

module.exports = {
  sendVerification: function(options, callback){
    var email = options.email,
    token = options.token;

    var url = 'http://' + config.client.host + '/#/action/verify/' + token;

    var mailOptions = {
      to: email,
      from: config.mail.senders.noreply,
      subject: 'Welcome to UPchieve! Please verify your account',
      text: [
        'Hello!',
        'Thank you registering an account on UPchieve. In order to use the website, follow the link below to verify your account:',
        url
      ].join('\n\n')
    };

    transporter.sendMail(mailOptions, callback);
  },

  sendReset: function(options, callback){
    var email = options.email,
        token = options.token;

    var url = 'http://' + config.client.host + '/#/action/reset/' + token;

    var mailOptions = {
      to: email,
      from: config.mail.senders.noreply,
      subject: 'Did you want to reset your password?',
      text: [
        'Click on this link to choose a new password!', url,
        'If you received this email by accident, you can just ignore it and your password will not change.'
      ].join('\n\n')
    };

    transporter.sendMail(mailOptions, callback);
  }

};
