const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0-openidconnect').Strategy;

const config = require('./config');
const routes = require('./routes');


const strategy = new Auth0Strategy(
  config.auth0,
  (issuer, audience, profile, callback) => {
    return callback(null, profile._json);
  },
);
// Original implementation in `passport-openidconnect` ignore options by
// returning `{}`.
//
// `passport-auth0-openidconnect` is supposed to override it but it doesn't.
//
// See: https://github.com/siacomuzzi/passport-openidconnect/blob/master/lib/strategy.js#L338
Auth0Strategy.prototype.authorizationParams = (options) => options;
passport.use(strategy);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const app = express();

app.use(logger('combined'));
app.use(session(config.session));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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
