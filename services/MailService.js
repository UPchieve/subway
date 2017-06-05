var config = require('../config');

var transporter = require('nodemailer').createTransport(config.mail.smtpConfig);

module.exports = {
  sendVerification: function(options, callback){

    var email = options.email,
        token = options.token;

    var url = 'http://' + config.client.host + '/#/action/verify/' + token;

    /* var mailOptions = {
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

    */

    var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: {
        personalizations: [
          {
            to: [
              {
                email: email
              }
            ],
            substitutions: {
                "-userEmail-": email, 
                "-verifyLink-": url
            }
          }
        ],
        from: {
          email: 'upchievetest@hotmail.com'
        },
        template_id: '142a621c-127a-46a1-b36a-d0689fd07877'
      }
    });

    // With promise
    // sg.API(request)
      // .then(function (response) {
        // console.log(response.statusCode);
        // console.log(response.body);
        // console.log(response.headers);
      //  })
      // .catch(function (error) {
        // error is an instance of SendGridError
        // The full response is attached to error.response
        // console.log(error.response.statusCode);
      // });

    // With callback
    sg.API(request, function (error, response) {
      if (error) {
        console.log('Error response received');
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
      } else {
        console.log('Mail sent')
      }
    });

  }
};
