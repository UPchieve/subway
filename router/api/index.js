var express = require('express');

module.exports = function(app){
	console.log('API module');

	var router = new express.Router();

	require('./user')(router);
	require('./verify')(router);

	app.use('/api', router);
};
