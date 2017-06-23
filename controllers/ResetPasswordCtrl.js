var async = require('async');
var crypto = require('crypto');

var MailService = require('../services/MailService');

var User = require('../models/User');

module.exports = {
  initiateReset: function(options, callback){
    var email = options.email;

    async.waterfall([

      // Generate the token
      function(user, done){
        crypto.randomBytes(16, function(err, buf) {
          var token = buf.toString('hex');
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
  },

  finishReset: function(options, callback){
    var token = options.token;

    async.waterfall([
      function(done){
        User.findOne({passwordRecoveryKey: token}, function(err, user){
          if (!user){
            return done(new Error('No user found with that password recovery key'));
          } else if (err){
            return done(err);
          }
          done(null, user);
        });
      },
      function(user, done){
        user.passwordRecoveryKey = undefined;
        user.save(function(err){
          done(err, user);
        });
      }
    ], callback);
  }
};
