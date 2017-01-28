var http = require('http');
var socket = require('socket.io');

var config = require('../../config/server.js');


module.exports = function(app){
  var server = http.createServer(app);
  var io = socket(server);

  io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('drawClick', function(data) {
      socket.broadcast.emit('draw', {
        x: data.x,
        y: data.y,
        type: data.type
      });
    });

    socket.on('saveImage', function() {
      socket.broadcast.emit('save');
    });

    socket.on('undoClick', function() {
      socket.broadcast.emit('undo');
    });

    socket.on('clearClick', function() {
      socket.broadcast.emit('clear');
    });

    socket.on('changeColor', function(data) {
      socket.broadcast.emit('color', data);
    });

    socket.on('changeWidth', function(data) {
      socket.broadcast.emit('width', data);
    });

    socket.on('dragStart', function(data) {
    	socket.broadcast.emit('dstart', {
    		x: data.x,
	    	y: data.y,
	    	color:data.color
    	});
    });

    socket.on('dragAction', function(data) {
    	socket.broadcast.emit('drag', {
    		x: data.x,
	    	y: data.y,
	    	color:data.color
    	});
    });

    socket.on('dragEnd', function(data) {
    	socket.broadcast.emit('dend', {
    		x: data.x,
	    	y: data.y,
	    	color:data.color
    	});
    });

    socket.on('insertText', function(data) {
      socket.broadcast.emit('text', {
        text: data.text,
        x: data.x,
        y: data.y
      });
    });

    socket.on('resetScreen', function() {
      socket.broadcast.emit('reset');
    });
  });		



  var port = config.socketsPort;
  server.listen(port);

  console.log('Sockets.io listening on port ' + port);
};
