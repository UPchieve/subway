var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
const saltRounds = 10;

var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');


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



    router.post('/login', function(req, res){
        User.find({
            email: req.body.email
        }, function(err, users){
            if (err){
                res.json({
                    err: err
                });
            } else {
                 var hash = users.password
                 bcrypt.compare(req.body.password, hash, function(err, res) {
                     if (res == false) {
                        res.json({
                            err:err
                        });
                     } else {
                        res.json({
                            users:users
                        });
                     }
                });
            }
        });
    });


    router.post('/register', function(req, res){
        var user = new User();
        user.email = req.body.email;

        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
                user.password = hash;
                user.save(function(err){
                    if (err){
                        res.json({
                            err: err
                        });
                    } else {
                        res.json({
                            msg: 'You have registered!'
                            var mailOptions = {
                                from: '"Fred Foo ?" <foo@blurdybloop.com>', // sender address
                                to: req.body.email, // list of receivers
                                subject: 'BelieveAchieve Account Verification', // Subject line
                                text: 'Welcome to BelieveAchieve', // plaintext body
                                html: '<b><a href=\"believeachieve.com/\"></b>' // html body
                            };
                            transporter.sendMail(mailOptions, function(error, info){
                                if(error){
                                    return console.log(error);
                                }
                                console.log('Message sent: ' + info.response);
                            });
                        });
                    }
                });
            });
        });

    });

    router.get('/verify', function(req, res){
        if (req.checkverification(req.verification, req.user);){
            res.json({
            msg: 'Verification successful'
            });
        } else {
            res.json({
                    err: 'Verification unsuccessful'
                });
        }
    }
};