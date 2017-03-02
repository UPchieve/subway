var SessionCtrl = require('../../controllers/SessionCtrl');

module.exports = function(router){
	router.route('/session/new')
		.post(function(req, res){
			var data = req.body || {},
					sessionType = data.sessionType,
					user = req.user;

			SessionCtrl.create({
				user: user,
				type: sessionType
			}, function(err, session){
				if (err){
					res.json({
						err: err
					});
				} else {
					res.json({
						sessionId: session._id
					});
				}
			});
		});
};
