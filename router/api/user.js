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

	router.get('/user', function(req, res){
		UserCtrl.get({
			userId: req.params.id
		}, 
		UserCtrl.get({
			picture: req.params.picture
		}, 
		UserCtrl.get({
			firstname: req.params.firstname
		},
		UserCtrl.get({
			lastname: req.params.lastname
		},
		UserCtrl.get({
			email: req.params.email
		}, 
		UserCtrl.get({
			year: req.params.year
		},
		UserCtrl.get({
			month: req.params.month
		}, 
		UserCtrl.get({
			day: req.params.day
		}, 
		UserCtrl.get({
			race: req.params.race
		}, 
		UserCtrl.get({
			highschool: req.params.highscool
		}, 
		function(err, profile){
			if (err){
				res.json({err: err});
			} else {
				res.json(profile);
			}
		});
	});
};