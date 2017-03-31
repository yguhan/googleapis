var google = require('googleapis');
var drive = google.drive('v2');

var SCOPES_GMAIL = ['https://www.googleapis.com/auth/gmail.readonly'];
var SCOPES_FILEFORMATTRANSFER = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/script.external_request',
      'https://www.googleapis.com/auth/script.scriptapp',
      'https://www.googleapis.com/auth/spreadsheets.readonly'
  ]
var SCOPES_SLIDES = ['https://www.googleapis.com/auth/presentations.readonly'];

var key = require('./FileFormatTransfer-4f315de8a26a.json');
var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  SCOPES_FILEFORMATTRANSFER,
  null
);
 

jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  }
 
  // Make an authorized request to list Drive files. 
  drive.files.list({
    auth: jwtClient
  }, function (err, resp) {
    // handle err and response 
    console.log(resp);
  });
});

// jwtClient.authorize(function (err, tokens) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   var gmail = google.gmail('v1');

//   // Make an authorized request to list Drive files. 
//   gmail.users.labels.list({
//     auth: jwtClient,
//     userId: 'me'
//   }, function (err, resp) {
//     if(err){
//         console.log('The API returned an error: ' + err);
//         return ;    
//     }
//     var labes = resp.labels;
//     // handle err and response 
//     console.log(labels);
//   });
// });

// jwtClient.authorize(function (err, tokens) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   var slides = google.slides('v1');
//   slides.presentations.get({
//     auth: jwtClient,
//     presentationId: "1nw4XTuQtUMRSvfp_uO0VnKqMCnca5Y1W4lPUgua4SIs"
//   }, function(err, presentation){
//     if(err){
//         console.log('The API returned an error: '+ err);    
//         return;
//     }
//     console.log(presentation);
//   })
// });

