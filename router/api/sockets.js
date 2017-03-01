var http = require('http');
var socket = require('socket.io');

var config = require('../../config/server.js');

var SessionCtrl = require('../../controllers/SessionCtrl.js');


module.exports = function(app){
  var server = http.createServer(app);
  var io = socket(server);

  io.on('connection', function(socket){

    // On new socket connection, init tracking objects for session/users
    var currentSession,
        student,
        volunteer;

    // Session management
    socket.on('join', function(data){

    });

    socket.on('end', function(){

    });

    socket.on('room', function(pRoom) {
      if (room) {
        socket.leave(room);
      }
      socket.join(pRoom);
      room = pRoom;
      console.log('Joining room', pRoom);
    });

    socket.on('message', function(data) {
      if (!data.room) return;
      console.log('SENDING MESSAGE');
      io.to(data.room).emit('messageSend', {
        senderName: data.senderName,
        timeStamp: data.timeStamp,
        message: data.message
      });
    });

    // Whiteboard interaction

    socket.on('drawClick', function(data) {
      if (!room) return;
      io.to(room).emit('draw', {
        x: data.x,
        y: data.y,
        type: data.type
      });
    });

    socket.on('saveImage', function() {
      if (!room) return;
      socket.broadcast.to(room).emit('save');
    });

    socket.on('undoClick', function() {
      if (!room) return;
      socket.broadcast.to(room).emit('undo');
    });

    socket.on('clearClick', function() {
      if (!room) return;
      io.to(room).emit('clear');
    });

    socket.on('changeColor', function(data) {
      if (!room) return;
      socket.broadcast.to(room).emit('color', data);
    });

    socket.on('changeWidth', function(data) {
      if (!room) return;
      socket.broadcast.to(room).emit('width', data);
    });

    socket.on('dragStart', function(data) {
      if (!room) return;
      console.log('Emitting to room', room);
      socket.broadcast.to(room).emit('dstart', {
        x: data.x,
        y: data.y,
        color:data.color
      });
    });

    socket.on('dragAction', function(data) {
      if (!room) return;
      socket.broadcast.to(room).emit('drag', {
        x: data.x,
        y: data.y,
        color:data.color
      });
    });

    socket.on('dragEnd', function(data) {
      if (!room) return;
      io.to(room).emit('dend', {
        x: data.x,
        y: data.y,
        color:data.color
      });
    });

    socket.on('insertText', function(data) {
      if (!room) return;
      io.to(room).emit('text', {
        text: data.text,
        x: data.x,
        y: data.y
      });
    });

    socket.on('resetScreen', function() {
      if (!room) return;
      io.to(room).emit('reset');
    });
  });



  var port = config.socketsPort;
  server.listen(port);

  console.log('Sockets.io listening on port ' + port);
};
