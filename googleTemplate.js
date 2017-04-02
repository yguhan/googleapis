var request = require('request-promise')
  , querystring = require('querystring');
const _ = require('lodash');

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
  authorize(JSON.parse(content), pdfCreator);
  // authorize(JSON.parse(content), formatChanger);
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

function formatChanger(auth, id){
  // var _presentationId = '1BtWL2NO5qtPyfdFqUneB30mAXCsK--tCeuuZTpRbJKA';
  var _drive = google.drive('v2');
  _drive.files.patch({
    auth: auth,
    fileId: id,
    resource: {
      "request": [
        {
          "mimeType":"application/pdf"
        }
      ]
    }
  }, function(err, result){
    if(err){
      console.log(err);
    }
    console.log(result['exportLinks']['application/pdf']);
  })

}

function pdfCreator(auth) {
  var _presentationId = '13Q4hwby7HPhhTlSRhc6AsXKxm4oIp-ZiKpRxRT164SA';
  var _slides = google.slides('v1');
  var _drive = google.drive('v2');

  
  var _replaceAllTextFactory = function(text, replaceText){
    return _replaceAllText =  {
      "replaceAllText": {
        "containsText": {
          "text": text,
          "matchCase": false
        },
        "replaceText": replaceText
      }
    }
  };

    //1, 0 ,2
  var _insertTableRowsFactory = function(tableObjectId, rowIndex, columnIndex, number){
    return _insertTableRows = {
      "insertTableRows": {
        "tableObjectId": tableObjectId,
        "cellLocation": {
          "rowIndex": rowIndex,
          "columnIndex": columnIndex
        },
        "insertBelow": true,
        "number": number
      }
    }
  };

  var _insertTextFactory = function(tableObjectId, rowIndex, columnIndex, text){
    return _insertText = {
      "insertText": {
          "objectId": tableObjectId,
          "cellLocation": {
            "rowIndex": rowIndex,
            "columnIndex": columnIndex
          },
          "text": text,
          "insertionIndex": 0
      }
    }
  }

  var _deleteObjectFactory = function(id){
    return _deleteObject = {
      "deleteObject": {
        "objectId": id,
      }
    }
  }

  var _slideReq = function(file, auth, callback){
    _slides.presentations.get({
      auth:auth,
      presentationId: file.id,
    }, function(err, slide){
      if(err){
        console.log(err);
      }
      
      var _tableObjectId = slide.slides[2].pageElements[1].objectId;

      // console.log(slide);

      var _payload = {
        "requests": [
        ]
      }
      
      //payload text
      _payload.requests.push(_replaceAllTextFactory("{고객명}", "삼성"));
      _payload.requests.push(_replaceAllTextFactory("{담당자명}", "한윤구"));
      _payload.requests.push(_replaceAllTextFactory("{항목}", "항목 A"));
      _payload.requests.push(_replaceAllTextFactory("{공과금}", "50000"));
      _payload.requests.push(_replaceAllTextFactory("{요약_총_공과금}", "50000"));
      _payload.requests.push(_replaceAllTextFactory("{요약_총_수수료}", "100000"));
      _payload.requests.push(_replaceAllTextFactory("{요약_총_비용}", "150000"));
      _payload.requests.push(_replaceAllTextFactory("{총_합계_N}", "200000"));
      _payload.requests.push(_replaceAllTextFactory("{고객명}", "삼성"));


      //payload table
      _payload.requests.push(_insertTableRowsFactory(_tableObjectId, 1, 0 ,2));
      _payload.requests.push(_insertTextFactory(_tableObjectId, 2, 0 ,"요약 항목2"));
      _payload.requests.push(_insertTextFactory(_tableObjectId, 2, 1 ,"항목2"));
      _payload.requests.push(_insertTextFactory(_tableObjectId, 2, 2 ,"공과금2"));
      _payload.requests.push(_insertTextFactory(_tableObjectId, 2, 3 ,"헬프미 수수료2"));

      //payload delete slide
      _payload.requests.push(_deleteObjectFactory('p16'));

      _slides.presentations.batchUpdate({
        auth: auth,
        presentationId: slide.presentationId,
        resource: _payload
      }, function(err, slide){
        if(err){
          console.log(err);
        }
        callback(auth, slide.presentationId);
      })
    })
  }

  var _file =  _drive.files.copy({
    auth: auth,
    fileId: _presentationId
    }, function(err, file){
      if(err){
        console.log(err);
      }
      _slideReq(file, auth, formatChanger);
  });
}