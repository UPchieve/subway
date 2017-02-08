var http = require('http');
var socket = require('socket.io');

var config = require('../../config/server.js');


module.exports = function(app){
  var server = http.createServer(app);
  var io = socket(server);

  io.on('connection', function(socket){

    socket.on('room', function(room){
      socket.join(room);

      socket.on('drawClick', function(data) {
        socket.to(room).emit('draw', {
          x: data.x,
          y: data.y,
          type: data.type
        });
      });

      socket.on('saveImage', function() {
        socket.to(room).emit('save');
      });

      socket.on('undoClick', function() {
        socket.to(room).emit('undo');
      });

      socket.on('clearClick', function() {
        socket.to(room).emit('clear');
      });

      socket.on('changeColor', function(data) {
        socket.to(room).emit('color', data);
      });

      socket.on('changeWidth', function(data) {
        socket.to(room).emit('width', data);
      });

      socket.on('dragStart', function(data) {
      	socket.to(room).emit('dstart', {
      		x: data.x,
  	    	y: data.y,
  	    	color:data.color
      	});
      });

      socket.on('dragAction', function(data) {
      	socket.to(room).emit('drag', {
      		x: data.x,
  	    	y: data.y,
  	    	color:data.color
      	});
      });

      socket.on('dragEnd', function(data) {
      	socket.to(room).emit('dend', {
      		x: data.x,
  	    	y: data.y,
  	    	color:data.color
      	});
      });

      socket.on('insertText', function(data) {
        socket.to(room).emit('text', {
          text: data.text,
          x: data.x,
          y: data.y
        });
      });

      socket.on('resetScreen', function() {
        socket.to(room).emit('reset');
      });
    });
  });



  var port = config.socketsPort;
  server.listen(port);

  console.log('Sockets.io listening on port ' + port);
};
