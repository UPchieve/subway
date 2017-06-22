var config = require('../config');
var helper = require('sendgrid').mail
var sendgrid = require('sendgrid')(config.sendgrid.apiKey);

// var transporter = require('nodemailer').createTransport(config.mail.smtpConfig);

module.exports = {

  // HTML version

  sendTemplatedEmail: function(mail, callback) {
  	  var request = sendgrid.emptyRequest({
	  method: 'POST',
	  path: '/v3/mail/send',
	  body: mail.toJSON()
	});

	sendgrid.API(request, callback);
  }, 

  sendVerification: function(options, callback){

    var email = options.email,
        token = options.token;

    var url = 'http://' + config.client.host + '/#/action/verify/' + token;

	var from_email = new helper.Email(config.mail.senders.noreply);
	var to_email = new helper.Email(email);
    var subject = 'I\'m replacing the subject tag';
	var content = new helper.Content('text/html', 'I\'m replacing the <strong>body tag</strong>');
	var mail = new helper.Mail(from_email, subject, to_email, content);
	mail.personalizations[0].addSubstitution(new helper.Substitution('-userEmail-', email));
	mail.personalizations[0].addSubstitution(new helper.Substitution('-verifyLink-', url));
	mail.setTemplateId(config.sendgrid.templateId);

	this.sendTemplatedEmail(mail, callback);

  },

  // plain text version

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
      }
      callback(err, res);
    });
  },
  sendPlainTextVerification: function(options, callback){
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
