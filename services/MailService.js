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
  // For students
  sendVerification: function(options, callback){
    var email = options.email,
        token = options.token;

    var url = 'http://' + config.client.host + '/#/action/verify/' + token;

    this.sendEmail({
      to: email,
      from: 'noreply@upchieve.org',
      subject: 'Welcome to UPchieve! Please verify your account',
      content: [
      {
        type: 'text/html',
        value: '<p>Hi there!</p><p>Thanks so much for signing up to use UPchieve, and we’re very excited to e-meet you!'+
        'Our on-demand tutoring and college counseling services are 100% free - just sign into your account between the hours'+ 
        'of 6pm-10pm any night to speak to a volunteer. (There’s even a video showing how to use the web app as soon as you log in!)' +
        'However, before we can connect you with a volunteer, we need you to verify you account by clicking on the following link. '+
        'Then, we’ll have you fill out a simple profile, and you’ll be able to start talking to a volunteer in ten minutes or less!</p>'+
        '<p>Account verification link: <a href=\"'+url+'\">'+url+'</a></p><p>If you’re interested in learning more about our organization, we encourage you to visit our'+ 
        '<a href="www.upchieve.org">website</a>. You can also connect with us on <a href="https://www.facebook.com/UPchieve/">Facebook</a>'+ 
        'or <a href="https://twitter.com/UPchieve">Twitter</a>. Finally, if you ever have any issues using the web app or have any other concerns,'+ 
        'feel free to email us at <a href="mailto:info@upchieve.org">info@upchieve.org</a> any time, and we’ll respond to you within 24 hours.</p>' +
         '<p>Hope to see you online soon!</p><p>Best wishes,</p><p>The UPchieve Team</p><p><a href="www.upchieve.org">www.upchieve.org</a></p>'
      }
    ]
    }, callback);

    // For volunteers
    /*
    sendVerification: function(options, callback){
    var email = options.email,
        token = options.token;

    var url = 'http://' + config.client.host + '/#/action/verify/' + token;

    this.sendEmail({
      to: email,
      from: 'noreply@upchieve.org',
      subject: 'Welcome to UPchieve! Please verify your account',
      content: [
      {
        type: 'text/html',
        value: '<p>Hi there!</p><p>Thanks so much for signing up to volunteer your time with UPchieve! We’re excited to work with you,'+
        ' and we know the students will be too! Finishing your account creation is easy, just click on the link below.</p>'+
        '<p><a href=\"'+url+'\">'+url+'</a></p><p>Here are a few other things to keep in mind:</p><ul><li>If you have any issues using the web app'+
        ', email <a href="mailto:support@upchieve.org">support@upchieve.org.</a></li><li>If you haven’t already been invited to our slack channel,'+
        ' please email <a href="mailto:jacob.fohtung@upchieve.org">jacob.fohtung@upchieve.org</a>. If you have been invited but haven’t signed up yet,'+
        ' please do this ASAP! It’s a great way to make sure you receive all announcements.</li><li>Please cancel shifts you can no longer do using the'+
        ' following form at least 24 hours in advance: (This link is also available on the “Resources” page within the app)</li><li>If you haven’t already'+
        ', make sure to like/follow us on <a href="https://www.facebook.com/UPchieve/">Facebook</a> and <a href="https://twitter.com/UPchieve">Twitter</a>!</li></ul>'+
        '<p>Thanks again for your support, and happy volunteering!</p><p>Best wishes,</p><p>The UPchieve Team</p><p><a href="www.upchieve.org">www.upchieve.org</a></p>'
      }
    ]
    }, callback);*/
    


  }
};
