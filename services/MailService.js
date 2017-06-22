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
	var mail = new helper.Mail(from_email, subject, to_email, content);
	mail.personalizations[0].addSubstitution(new helper.Substitution('-userEmail-', email));
	mail.personalizations[0].addSubstitution(new helper.Substitution('-verifyLink-', url));
	mail.setTemplateId(config.sendgrid.templateId);

	this.sendTemplatedEmail(mail, callback);

  },

  // plain text version

  sendPlainTextEmail: function(options, callback){
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
  }

};
