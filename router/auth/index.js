var express = require('express');
var session = require('express-session');
var passport = require('passport');
var MongoStore = require('connect-mongo')(session);

var VerificationCtrl = require('../../controllers/VerificationCtrl');

var config = require('../../config.js');
var User = require('../../models/User.js');

module.exports = function(app){
  console.log('Auth module');

  require('./passport');
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.sessionSecret,
    store: new MongoStore({ url: config.database, autoReconnect: true, collection: 'auth-sessions' }),
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
      // If successfully authed, return user object (otherwise 401 is returned from middleware)
      res.json({
          user: req.user
      });
    }
  );

  router.post('/register', function(req, res){
    var email = req.body.email,
        password = req.body.password,
        code = req.body.code;

    if (!email || !password){
      return res.json({
        err: 'Must supply an email and password for registration'
      });
    } else if (!code){
      return res.json({
        err: 'Must provide a code to register'
      });
    }

    User.checkCode(code, function(err, data){
      if (err){
        res.json({
          err: err
        });
      } else if (!data.studentCode && !data.volunteerCode){
        res.json({
          err: 'Invalid registation code'
        });
      } else {
        var user = new User();
        user.email = email;
        user.isVolunteer = data.volunteerCode === true;

        user.hashPassword(password, function(err, hash){
          user.password = hash; // Note the salt is embedded in the final hash

          if (err){
            res.json({
              err: 'Could not hash password'
            });
            return;
          }

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
                var msg;
                if (err){
                  msg = 'Registration successful. Error sending verification email: ' + err;
                } else {
                  msg = 'Registration successful. Verification email sent to ' + email;
                }

                req.login(user, function(err){
                  if (err){
                    res.json({
                      msg: msg,
                      err: err
                    });
                  } else {
                    res.json({
                      msg: msg,
                      user: user
                    });
                  }
                });
              });
            }
          });
        });
      }
    })
  });

  router.post('/register/check', function(req, res){
    var code = req.body.code;
    console.log(code);
    if (!code){
      res.json({
        err: 'No registration code given'
      });
      return;
    }
    User.checkCode(code, function(err, data){
      if (err){
        res.json({
          err: err
        });
      } else {
        res.json({
          valid: data.studentCode || data.volunteerCode
        });
      }
    });
  });

  app.use('/auth', router);
};
