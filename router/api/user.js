var UserCtrl = require('../../controllers/UserCtrl');

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

	router.put('/user', function(req, res){
		var data = req.body || {};

		UserCtrl.update({
			userId: req.user._id,
			data: {
				picture: data.picture
			}
		}, function(err, user){
			if (err){
				res.json({err: err});
			} else {
				res.json({
					user: user
				});
			}
		});
	});

	router.get('/user/:id', function(req, res){
		UserCtrl.get({
			userId: req.params.id
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});
};
