const express = require('express');
const passport = require('passport');
const httpProxy = require('http-proxy');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
const router = express.Router();

const config = require('./config');


const RETURN_TO = encodeURI(`${config.app.protocol}://${config.app.host}`);
const SSO_LOGOUT_URL = `https://${config.auth0.domain}${config.auth0.sso_logout_url}?returnTo=${RETURN_TO}&client_id=${config.auth0.clientID}`;


const proxy = httpProxy.createProxyServer({
  target: config.kibana.URL,
  prependPath: false,
  changeOrigin: true
});

proxy.on('error', function(e) {
  console.log('Error connecting');
  console.log(e);
});

/* Healthcheck endpoint */
router.get('/healthz', (req, res) => res.sendStatus(200));

/* Handle login */
router.get('/login', (req, res, next) => {
  if (req.isAuthenticated()) {
    if (/^http/.test(req.session.returnTo)) {
      const err = new Error('URL must be relative');
      err.status = 400;
      next(err);
    } else {
      res.redirect(req.session.returnTo);
    }
  } else {
    passport.authenticate('auth0-oidc')(req, res, next);
  }
});

/* Handle logout */
router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy(() => {
    res.clearCookie(config.session.name);
    res.redirect(SSO_LOGOUT_URL);
  });
});

/* Handle auth callback */
router.get('/callback', [
  passport.authenticate('auth0-oidc', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/');
  },
]);

router.all('/favicon.ico', function(req, res, next) {
  proxy.web(req, res);
});

function kibanaAuthCredsForUser(user) {
  let is_admin = false;

  try {
    const groups = user.app_metadata.authorization.groups;
    is_admin = groups.indexOf('cluster-admins') !== -1;
  } catch (e) {
    // is_admin is false if couldn't read groups
  }

  if (is_admin) {
    return config.kibana.adminCreds;
  }

  return config.kibana.creds;
};

/* Authenticate and proxy all other requests */
router.all(/.*/, ensureLoggedIn, function(req, res, next) {
  proxy.web(req, res, {
    auth: kibanaAuthCredsForUser(req.user),
  });
});


module.exports = router;
