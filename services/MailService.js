var config = require('../config');

// var transporter = require('nodemailer').createTransport(config.mail.smtpConfig);

module.exports = {

  sendVerification: function(options, callback){

    var email = options.email,
        token = options.token;

    var url = 'http://' + config.client.host + '/#/action/verify/' + token;

    var helper = require('sendgrid').mail
    var from_email = new helper.Email(config.mail.senders.noreply);
    var to_email = new helper.Email(email);
    var subject = '';
    var content = new helper.Content('text/html', '');
    var mail = new helper.Mail(from_email, subject, to_email, content);
    mail.personalizations[0].addSubstitution(new helper.Substitution('-userEmail-', email));
    mail.personalizations[0].addSubstitution(new helper.Substitution('-verifyLink-', url));
    mail.setTemplateId('142a621c-127a-46a1-b36a-d0689fd07877');

    require('./TemplatedEmail').sendTemplatedEmail(mail, callback);

  }

};
