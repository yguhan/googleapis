var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var key = require('./client_secret.json');

var oauth2Client = new OAuth2(
  key.installed.client_id,
  key.installed.client_secret,
  key.installed.redirect_uris
);

console.log(key.installed.redirect_uris)

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/calendar'
];

var url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes,

  // Optional property that passes state parameters to redirect URI
  // state: { foo: 'bar' }
});

console.log(url);