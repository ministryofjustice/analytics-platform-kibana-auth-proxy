var express = require('express');
var passport = require('passport');
var httpProxy = require('http-proxy');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
var router = express.Router();

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback',
  USER: process.env.USER,
}

var proxy = httpProxy.createProxyServer({
  target: process.env.KIBANA_URL,
  prependPath: false,
  changeOrigin: true,
  auth: process.env.KIBANA_USERNAME + ':' + process.env.KIBANA_PASSWORD
});

proxy.on('error', function(e) {
  console.log('Error connecting');
  console.log(e);
});

/* Handle login */
router.get('/login',
  function(req, res){
    res.render('login', { env: env });
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

/* Authenticate and proxy all other requests */
router.all(/.*/, ensureLoggedIn, function(req, res, next) {
  proxy.web(req, res);
});


module.exports = router;
