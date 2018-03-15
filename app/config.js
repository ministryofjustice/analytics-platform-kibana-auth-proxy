const config = module.exports;


config.app = {
  protocol: process.env.APP_PROTOCOL || 'http',
  host: process.env.APP_HOST || 'localhost:3000',
};

config.auth0 = {
  callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback',
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  domain: process.env.AUTH0_DOMAIN,
  scope: 'profile',
  sso_logout_url: '/v2/logout',
  prompt: 'none',
};

config.express = {
  port: process.env.PORT || '3000',
}

config.session = {
  name: 'session',
  resave: true,
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET || 'shh-its-a-secret',
  cookie: {
    // `COOKIE_MAXAGE` in seconds (defaults to 1 hour = 3,600,000 ms)
    maxAge: (Number.parseInt(process.env.COOKIE_MAXAGE, 10) || 3600) * 1000,
  },
};

config.kibana = {
  URL: process.env.KIBANA_URL,
  adminCreds: process.env.KIBANA_ADMIN_USERNAME + ':' + process.env.KIBANA_ADMIN_PASSWORD,
  creds: process.env.KIBANA_USERNAME + ':' + process.env.KIBANA_PASSWORD,
}
