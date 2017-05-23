var config = require('../config');

var sg = require('sendgrid')(config.sendgridApiKey);
var helper = require('sendgrid').mail;

module.exports = {
  sendEmail: function(options, callback){
    options = options || {};

    var fromEmail = new helper.Email(options.from),
        toEmail = new helper.Email(options.to),
        subject = options.subject || 'New message from UPchieve',
        content = new helper.Content('text/plain', options.content);

    var mail = new helper.Mail(fromEmail, subject, toEmail, content);

    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });

    sg.API(request, function(err, res) {
      if (err) {
        console.log('SendGrid error');
        console.log(err);
      } else {
        console.log('Sent email via SendGrid:', res.statusCode);
        console.log(res.body);
        console.log(res.headers);
      }
      callback(err, res);
    });
  },
  sendVerification: function(options, callback){
    var email = options.email,
        token = options.token;

    var url = 'http://' + config.client.host + '/#/action/verify/' + token;

    this.sendEmail({
      to: email,
      from: 'noreply@upchieve.org',
      subject: 'Welcome to UPchieve! Please verify your account',
      content: [
        'Hello!',
        'Thank you registering an account on UPchieve. In order to use the website, follow the link below to verify your account:',
        url
      ].join('\n\n')
    }, callback);

  }
};
