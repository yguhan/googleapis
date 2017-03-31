var request = require('request-promise')
  , querystring = require('querystring');

var GoogleRequest = function(hostname, token) {

  self = this;
  self._hostname = hostname;
  self._token = token;

  self.post = function(uri, payload) {

    request({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + self._token,
      },
      uri: self._hostname + uri,
      payload: {
        payload: JSON.stringify(payload),
      },
    })
    .then(function(data) {
      return data;
    })
    .catch(function(err) {
      return err;
    });
  };

  self.get = function(uri) {

    request({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + self._token,
      },
      uri: self._hostname + uri,
    })
    .then(function(data) {
      //console.log(data);
      return data;
    })
    .catch(function(err) {
      console.log('err');
      console.log(err);
      return err;
    });
  };
};

// module.exports = new Slack();




var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = [
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/presentations.readonly',
];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // getNewToken(oauth2Client, callback);
  //Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  var _presentationId = '13Q4hwby7HPhhTlSRhc6AsXKxm4oIp-ZiKpRxRT164SA';
  var _slides = google.slides('v1');
  var _drive = google.drive('v2');

  var _payload = {
    "requests": [
      {
        "replaceAllText": {
          "containsText": {
            "text": "{고객명}",
            "matchCase": true
          },
          "replaceText": "헬프미"
        }
      },
      {
        "replaceAllText": {
          "containsText": {
            "text": "{요약_총_비용}",
            "matchCase": true
          },
          "replaceText": "10,000"
        }
      },
      {
        "replaceAllText": {
          "containsText": {
            "text": "{총_합계__N}",
            "matchCase": true
          },
          "replaceText": "20,000"
        }
      }
    ]
  }

  var _replaceAllTextRequest = function(slide, auth){
    _slides.presentations.batchUpdate({
      auth: auth,
      presentationId: slide.id,
      resource: _payload
    })
  }

  let _newSlideId;

  var _file =  _drive.files.copy({
    auth: auth,
    fileId: _presentationId
    }, function(err, file){
      if(err){
        return err;
      }
      // _newSLideId = file.id;
      _replaceAllTextRequest(file, auth);
  });

}



