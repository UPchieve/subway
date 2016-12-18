var async = require('async');
var crypto = require('crypto');

var MailCtrl = require('./MailCtrl');

var User = require('../models/User');

module.exports = {
  initiateVerification: function(options, callback){
    var userId = options.userId,
        email = options.email;

    async.waterfall([
      function(done){
        User.findById(userId, function(err, user){
          if (err){
            return done(err);
          }
          if (!user) {
            return done(new Error('No account with that id found.'));
          } else if (user.verified){
            return done(new Error('User is already verified'));
          }
          done(null, user);
        });
      },
      function(user, done){
        // Generate the token and save token and user email to database
        crypto.randomBytes(16, function(err, buf) {
          var token = buf.toString('hex');

          user.email = email;
          user.verificationToken = token;
          user.save(function(err){
            done(err, token, email);
          });
        });
      },
      function(token, email, done){
        MailCtrl.sendVerification({
          email: email,
          token: token
        }, function(err){
          done(err, email);
        });
      }
    ], callback);
  },

  finishVerification: function(options, callback){
    var token = options.token;

    async.waterfall([
      function(done){
        User.findOne({verificationToken: token}, function(err, user){
          if (!user){
            return done(new Error('No user found with that verification token'));
          } else if (err){
            return done(err);
          }
          done(null, user);
        });
      },
      function(user, done){
        user.verificationToken = undefined;
        user.verified = true;
        user.save(function(err){
          done(err, user);
        });
      }
    ], callback);
  }
};
