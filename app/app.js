var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0-openidconnect').Strategy;

var config = require('./config');
var routes = require('./routes');

// This will configure Passport to use Auth0
const strategy = new Auth0Strategy(
  config.auth0,
  ((req, issuer, audience, profile, accessToken, refreshToken, params, callback) => {

    req.session.id_token = params.id_token;

    return callback(null, profile._json);
  }),
);
// Original implementation in `passport-openidconnect` ignore options by
// returning `{}`.
//
// `passport-auth0-openidconnect` is supposed to override it but it doesn't.
//
// See: https://github.com/siacomuzzi/passport-openidconnect/blob/master/lib/strategy.js#L338
Auth0Strategy.prototype.authorizationParams = (options) => options;
passport.use(strategy);

// you can use this section to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var app = express();

app.use(logger('combined'));
app.use(cookieParser());
app.use(session(config.session));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler

app.use(function(err, req, res, next) {
  response = { 'error': err.message };

  // development error handler include details (e.g. stacktrace)
  if (app.get('env') === 'development') {
    response['details'] = err;
  }

  res.status(err.status || 500);
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(response));
});


module.exports = app;
