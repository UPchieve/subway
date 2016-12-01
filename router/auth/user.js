var bcrypt = require('bcrypt');

var passport = require('passport');

var config = require('../../config/server.js');
var User = require('../../models/User.js');

module.exports = function(router){
    router.route('/user')
        .get(function(req, res){
            if (req.user){
                res.json({
                    user: req.user
                });
            } else {
                res.json({
                    err: 'Client has no authenticated session'
                });
            }
        });

    router.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
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
              res.json({
                msg: 'Registration successful'
              });
            }
          })
        })
      })
    });
};
