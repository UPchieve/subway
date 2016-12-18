var VerificationCtrl = require('../../controllers/VerificationCtrl');

module.exports = function(router){
	router.post('/verify/send', function(req, res){
		var email = req.body.email,
				userId = req.user && req.user._id;

		if (!email){
			return res.json({err: 'Must supply an email address to verify'});
		} else if (!userId){
			return res.json({err: 'Must be authenticated to send verification email'});
		}

		VerificationCtrl.initiateVerification({
			userId: userId,
			email: email,
		}, function(err, email){
			if (err){
				res.json({err: err});
			} else {
				res.json({msg: 'Verification email sent to ' + email});
			}
		});
	});

	router.post('/verify/confirm', function(req, res){
		var token = req.body.token;
		VerificationCtrl.finishVerification({
			token: token
		}, function(err, user){
			if (err){
				res.json({err: err});
			} else {
				res.json({
					msg: 'Verification successful'
				});
			}
		});
	});
};
