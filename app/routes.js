var express = require('express');
var passport = require('passport');
var httpProxy = require('http-proxy');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
var router = express.Router();

const config = require('./config');


var proxy = httpProxy.createProxyServer({
  target: config.kibana.URL,
  prependPath: false,
  changeOrigin: true
});

proxy.on('error', function(e) {
  console.log('Error connecting');
  console.log(e);
});

/* Handle login */
router.get('/login',
  function(req, res){
    res.render('login', { auth0: config.auth0 });
  }
);

/* Handle logout */
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

/* Handle auth callback */
router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/');
  }
);

router.all('/favicon.ico', function(req, res, next) {
  proxy.web(req, res);
});

var kibanaAuthCredsFromRequest = function(req){
  if (req.user.provider === 'google-oauth2') {
    return config.kibana.adminCreds;
  } else {
    return config.kibana.creds;
  }
};

/* Authenticate and proxy all other requests */
router.all(/.*/, ensureLoggedIn, function(req, res, next) {
  proxy.web(req, res, {
    auth: kibanaAuthCredsFromRequest(req)
  });
});


module.exports = router;
