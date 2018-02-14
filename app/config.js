const config = module.exports;


config.auth0 = {
  callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback',
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  domain: process.env.AUTH0_DOMAIN,
  scope: 'openid profile',
};

config.express = {
  port: process.env.PORT || '3000',
}

config.session = {
  name: 'session',
  resave: true,
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET || 'shh-its-a-secret',
};

config.kibana = {
  URL: process.env.KIBANA_URL,
  adminCreds: process.env.KIBANA_ADMIN_USERNAME + ':' + process.env.KIBANA_ADMIN_PASSWORD,
  creds: process.env.KIBANA_USERNAME + ':' + process.env.KIBANA_PASSWORD,
}

// TODO: Used for websockets, but not passed in?
config.shiny = {
  host: process.env.SHINY_HOST,
  port: process.env.SHINY_PORT,
}
