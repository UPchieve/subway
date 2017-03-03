var http = require('http');
var socket = require('socket.io');

var config = require('../../config.js');

var User = require('../../models/User.js');
var SessionCtrl = require('../../controllers/SessionCtrl.js');


module.exports = function(app){
  var server = http.createServer(app);
  var io = socket(server);

  var activeSessions = {},   // id => Session
      sessionUsers = {},     // id => [User]
      _sessionSockets = {}; // id => socket

  io.on('connection', function(socket){

    // Session management
    socket.on('join', function(data){
      console.log('Joining session...', data.sessionId);
      SessionCtrl.joinSession({
        sessionId: data.sessionId,
        user: data.user,
        socket: socket
      }, function(err, session){
        if (err){
          console.log('Could not join session');
          io.emit('error', err);
        } else {
          socket.join(data.sessionId);
          console.log('Session joined:', session);
          io.emit('sessions', SessionCtrl.getSocketSessions());
        }
      })
    });

    socket.on('disconnect', function(){
      console.log('Client disconnected');

      SessionCtrl.leaveSession({
        socket: socket
      }, function(err, session){
        if (err){
          console.log('Error leaving session', err);
        } else if (session){
          console.log('Left session', session._id)
          socket.leave(session._id);
          io.emit('sessions', SessionCtrl.getSocketSessions());  
        }
      });
    });

    socket.on('list', function(){
      io.emit('sessions', SessionCtrl.getSocketSessions());
    });


    socket.on('message', function(data) {
      if (!data.sessionId) return;
      console.log('SENDING MESSAGE');
      var session = activeSessions[data.sessionId];
      var message = {
        senderName: data.senderName,
        timeStamp: data.timeStamp,
        message: data.message
      };

      session.sendMessage(message, function(){
        io.to(data.sessionId).emit('messageSend', message);
      })
    });

    // Whiteboard interaction

    socket.on('drawClick', function(data) {
      io.to(data.sessionId).emit('draw', {
        x: data.x,
        y: data.y,
        type: data.type
      });
    });

    socket.on('saveImage', function(data) {
      io.in(data.sessionId).emit('save');
    });

    socket.on('undoClick', function(data) {
      io.in(data.sessionId).emit('undo');
    });

    socket.on('clearClick', function(data) {
      io.to(data.sessionId).emit('clear');
    });

    socket.on('changeColor', function(data) {
      io.in(data.sessionId).emit('color', data);
    });

    socket.on('changeWidth', function(data) {
      io.in(data.sessionId).emit('width', data);
    });

    socket.on('dragStart', function(data) {
      io.in(data.sessionId).emit('dstart', {
        x: data.x,
        y: data.y,
        color:data.color
      });
    });

    socket.on('dragAction', function(data) {
      io.in(data.sessionId).emit('drag', {
        x: data.x,
        y: data.y,
        color:data.color
      });
    });

    socket.on('dragEnd', function(data) {
      io.to(data.sessionId).emit('dend', {
        x: data.x,
        y: data.y,
        color:data.color
      });
    });

    socket.on('insertText', function(data) {
      io.to(data.sessionId).emit('text', {
        text: data.text,
        x: data.x,
        y: data.y
      });
    });

    socket.on('resetScreen', function() {
      io.to(data.sessionId).emit('reset');
    });
  });



  var port = config.socketsPort;
  server.listen(port);

  console.log('Sockets.io listening on port ' + port);
};
