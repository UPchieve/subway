var express = require('express');
var session = require('express-session');
var passport = require('passport');
var bcrypt = require('bcrypt');
var MongoStore = require('connect-mongo')(session);

var VerificationCtrl = require('../../controllers/VerificationCtrl');

var config = require('../../config/server.js');
var User = require('../../models/User.js');

module.exports = function(app){
  console.log('Auth module');

  require('./passport');
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.sessionSecret,
    store: new MongoStore({ url: config.database, autoReconnect: true }),
    cookie: {
      httpOnly: false
    }
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  var router = new express.Router();

  router.get('/logout', function(req, res){
      req.logout();
      res.json({
        msg: 'You have been logged out'
      });
  });

  router.post('/login',
    passport.authenticate('local'), // Delegate auth logic to passport middleware
    function(req, res) {
      console.log(res.get('Content-Type'));
      console.log(req.sessionID);
      // If successfully authed, return user object (otherwise 401 is returned from middleware)
      res.json({
          user: req.user
      });
    }
  );

  router.post('/register', function(req, res){
    var email = req.body.email,
        password = req.body.password;

    if (!email || !password){
      return res.json({
        err: 'Must supply an email and password for registration'
      });
    }

    var user = new User();
    user.email = email;

    bcrypt.genSalt(config.saltRounds, function(err, salt){
      bcrypt.hash(password, salt, function(err, hash){
        user.password = hash; // Note the salt is embedded in the final hash

        user.save(function(err){
          if (err){
            res.json({
              err: err
            });
          } else {
            VerificationCtrl.initiateVerification({
              userId: user._id,
              email: user.email
            }, function(err, email){
              if (err){
                res.json({msg: 'Registration successful. Error sending verification email: ' + err});
              } else {
                res.json({msg: 'Registration successful. Verification email sent to ' + email});
              }
            });
          }
        })
      })
    })
  });

  app.use('/auth', router);
};
