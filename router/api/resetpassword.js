var VerificationCtrl = require('../../controllers/ResetPasswordCtrl');

module.exports = function(router){
	router.post('/reset/send', function(req, res){
		var userId = req.user && req.user._id;

		if (!userId){
			return res.json({err: 'Must be authenticated to send password reset email'});
		}

		ResetPasswordCtrl.initiateReset({
			userId: userId
		}, function(err, email){
			if (err){
				res.json({err: err});
			} else {
				res.json({msg: 'Reset email sent to ' + email});
			}
		});
	});

	router.post('/reset/confirm', function(req, res){
		var token = req.body.token;
		VerificationCtrl.finishReset({
			token: token
		}, function(err, user){
			if (err){
				res.json({err: err});
			} else {
				res.json({
					msg: 'Password reset successful'
				});
			}
		});
	});
};
