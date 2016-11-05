var express = require('express');
var session = require('express-session');
var flash = require('express-flash');
var passport = require('passport');

var MongoStore = require('connect-mongo')(session);
var config = require('../../config/server');

module.exports = function(app){
  console.log('Auth module');

  require('./passport');

  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.sessionSecret,
    store: new MongoStore({ url: config.database, autoReconnect: true }),
    cookie: { httpOnly: false }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  var router = new express.Router();

  require('./user')(router);

  app.use('/auth', router);
};
