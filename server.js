/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , app = express();

 app.set('port', process.env.PORT || 3000);

 require('./data/busStop.js').init();

/* Importing the function from app.js and parsing app(express instance).
   Refer to app.js to find out about the files that are being required.
*/
require("./telegram-bot-master.js")(app);

// Initializing the server when server.js is being executed
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
