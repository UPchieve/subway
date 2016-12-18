var VerificationCtrl = require('../../controllers/VerificationCtrl');

module.exports = function(router){
	router.post('/verify/send', function(req, res){
		VerificationCtrl.initiateVerification({
			userId: req.user._id,
			email: req.body.email,
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
