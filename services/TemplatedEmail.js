var sendgrid = require('sendgrid')('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');

module.exports = {

  sendTemplatedEmail: function(mail, callback) {
  	  var request = sendgrid.emptyRequest({
	  method: 'POST',
	  path: '/v3/mail/send',
	  body: mail.toJSON()
	});

	sendgrid.API(request, callback);
  }

};
