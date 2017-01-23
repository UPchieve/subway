var http = require('http');
var socket = require('socket.io');

var config = require('../../config/server.js');


module.exports = function(app){
  var server = http.createServer(app);
  var io = socket(server);

  io.on('connection', function(socket){
    console.log('a user connected');
  });

  var port = config.socketsPort;
  server.listen(port);

  console.log('Sockets.io listening on port ' + port);
};
