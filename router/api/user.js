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
				year: data.year,
				month: data.month,
				day: data.day,
				email: data.email,
				picture: data.picture,
				picture: data.race,
				highschool: data.highschool,
				subject: data.subject,
				firstname: data.firstname,
				lastname: data.lastname,
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

	router.get('/user/:picture', function(req, res){
		UserCtrl.get({
			picture: req.params.picture
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});

	router.get('/user/:firstname', function(req, res){
		UserCtrl.get({
			firstname: req.params.firstname
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});

	router.get('/user/:lastname', function(req, res){
		UserCtrl.get({
			lastname: req.params.lastname
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});

	router.get('/user/:email', function(req, res){
		UserCtrl.get({
			email: req.params.email
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});

	router.get('/user/:year', function(req, res){
		UserCtrl.get({
			year: req.params.year
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});

	router.get('/user/:month', function(req, res){
		UserCtrl.get({
			month: req.params.month
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});

	router.get('/user/:day', function(req, res){
		UserCtrl.get({
			day: req.params.day
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});

	router.get('/user/:race', function(req, res){
		UserCtrl.get({
			race: req.params.race
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});

	router.get('/user/:highschool', function(req, res){
		UserCtrl.get({
			highschool: req.params.highscool
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});

	router.get('/user/:year', function(req, res){
		UserCtrl.get({
			subject: req.params.subject
		}, function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});
};