var express = require('express');
var session = require('express-session');
var flash = require('express-flash');
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
    cookie: { httpOnly: false }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

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

  router.put('/changename', function(req, res){
    var firstname = req.body.firstname
        lastname = req.body.lastname

      if (!firstname && !lastname){
        return res.json({
          err: 'No name to change'
        });
      }

      .get(function(req, res){
            if (req.user){
                res.json({
                    user: req.user
                    user.firstname = firstname
                    user.lastname = lastname
                });
            } else {
                res.json({
                    err: 'User does not exist'
                });
            }
        });
    }

  router.post('/picture', function(req, res){
    var picture = req.body.picture

      if (!picture){
        return res.json({
          err: 'No picture URL given'
        });
      }

      .get(function(req, res){
            if (req.user){
                res.json({
                    user: req.user
                    user.picture = picture
                });
            } else {
                res.json({
                    err: 'User does not exist'
                });
            }
        });
    }
  router.post('/register', function(req, res){
    var email = req.body.email,
        firstname = req.body.firstname,
        lastname = req.body.lastname,
        race = req.body.race,
        hs = req.body.hs,
        subject = req.body.subject, // Difficult academic subject
        password = req.body.password,
        // Birth date information
        year = req.body.year,
        month = req.body.month,
        day = req.body.day;


    if (!email || !password){
      return res.json({
        err: 'Must supply an email and password for registration'
      });
    }

// Uncomment if more information is needed for registration
/*
    if (!firstname || !lastname) {
      return res.json({
        err: 'Must supply a first name and last name for registration'
      });
    }

    if (!race) {
      return res.json({
        err: 'Must supply a race or ethnicity for registration'
      });
    }

    if (!hs) {
      return res.json({
        err: 'Must supply a valid high school for registration'
      });
    }

    if (!subject) {
      return res.json({
        err: 'Must supply a difficult academic subject for registration'
      });
    }
    
    // Verify valid birth date for registration
    if (!year || !month || !day) {
      return res.json({
        err: 'Must supply a complete birth date for registration'
      });
    }
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return res.json({
        err: 'Please use valid birth date (e.g. 01/01/1970)'
      });
    }
*/

    // Verify password for registration
    if (password.length < 8) {
      return res.json({
        err: 'Password must be 8 characters or longer'
      });
    }

    var numUpper = 0;
    var numLower = 0;
    var numNumber = 0;
    for (var i = 0; i < password.length; i++) {
      if (password[i].toUppercase() == password[i]) {
        numUpper += 1;
      }
      else if (password[i].toLowercase() == password[i]) {
        numLower += 1;
      }
      else if (!isNaN(password[i])) {
        numNumber += 1;
      }
    }
    if (numUpper == 0) {
      return res.json({
        err: 'Password must contain at least one uppercase letter'
      });
    }
    if (numLower == 0) {
      return res.json({
        err: 'Password must contain at least one lowercase letter'
      });
    }
    if (numNumber == 0) {
      return res.json({
        err: 'Password must contain at least one number'
      });
    }

    var user = new User();
    user.email = email,
    user.firstname = firstname,
    user.lastname = lastname,
    user.race = race,
    user.hs = hs,
    user.subject = subject, // Difficult academic subject
    // Birth date information
    user.year = year,
    user.month = month,
    user.day = day;

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
