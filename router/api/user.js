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
				username: data.username,
				picture: data.picture,
				race: data.race,
				hs: data.hs,
				subject: data.subject,
				year: data.year,
				month: data.month,
				day: data.day,
				email: data.email
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

    router.put('/picture', function(req, res){
    var picture = req.body.picture

      if (!picture || !/\S/.test(picture)){
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

    router.put('/name', function(req, res){
    var firstname = req.body.firstname
    var lastname = req.body.lastname

      if (!firstname || !/\S/.test(firstname)){
        return res.json({
          err: 'No first name given'
        });
      }

      if (!lastname || !/\S/.test(lastname)){
        return res.json({
          err: 'No last name given'
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
};