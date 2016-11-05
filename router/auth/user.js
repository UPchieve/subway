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
};
