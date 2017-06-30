var async = require('async');
var crypto = require('crypto');

var MailService = require('../services/MailService');

var User = require('../models/User');

module.exports = {
  initiateReset: function(options, callback){
    var email = options.email;

    async.waterfall([

      // Find the user to be verified
      function(done){
        User.findOne({email: email}, function(err, user){
          if (err){
            return done(err);
          }
          if (!user) {
            return done(new Error('No account with that id found.'));
          }
          done(null, user);
        });
      },

      // Generate the token and save token and user email to database
      function(user, done){
        crypto.randomBytes(16, function(err, buf) {
          var token = buf.toString('hex');

          user.registrationToken = token;

          user.save(function(err){
            done(err, token, user.email);
          });
        });
      },

      // Send an email
      function(token, email, done){
        MailService.sendReset({
          email: email,
          token: token
        }, function(err){
          done(err, email);
        });
      }
    ], callback);
  }
};
