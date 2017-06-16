var config = require('../config');
var helper = require('sendgrid').mail
var sendgrid = require('sendgrid')(config.sendgrid.apiKey);

// var transporter = require('nodemailer').createTransport(config.mail.smtpConfig);

module.exports = {

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

  }

};
