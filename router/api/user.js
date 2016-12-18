var ProfileCtrl = require('../../controllers/ProfileCtrl');

module.exports = function(router){
	router.put('/user', function(){
		var data = req.body || {};
		// Update coords
		ProfileCtrl.update({
			userId: req.user._id,
			data: {
				// fieldName: data.fieldName
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
		ProfileCtrl.get({
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
