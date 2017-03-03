var Q = require('q');

var Session = require('../models/Session');

// A socket session tracks a session with its users and sockets
var SocketSession = function(options){
  this.session = options.session;
  this.users = []; // [User]
  this.sockets = {}; // userId => socket
};

// Add a socket and user to the session. If the user already has a socket, disconnect and replace it
SocketSession.prototype.join = function(options){
  var user = options.user,
      socket = options.socket;

  var userIndex = this.users.indexOf(function(joinedUser){
    return joinedUser._id === user._id
  });

  if (userIndex !== -1){
    var socket = this.sockets[user._id];
    if (socket){
      socket.disconnect(0);
    }
    this.users.splice(userIndex, 1);
  }

  this.users.push(user);
  this.sockets[user._id] = socket;

};

SocketSession.prototype.leave = function(socket){
  var userId;

  Object.keys(this.sockets).some(function(socketUserId){
    if (this.sockets[socketUserId] === socket){
      userId = socketUserId;
      return true;
    }
  }, this);

  var userIndex = this.users.indexOf(function(joinedUser){
    return joinedUser._id === userId
  });

  if (userIndex !== -1){
    this.users.splice(userIndex, 1);
  }

  delete this.sockets[userId];
};

SocketSession.prototype.hasSocket = function(socket){
  return Object.keys(this.sockets).some(function(userId){
    return this.sockets[userId] === socket
  }, this);
};

SocketSession.prototype.isDead = function(){
  return this.users.length > 0;
};

var SessionManager = function(){
  this._sessions = {}; // id => SocketSession
};

SessionManager.prototype.connect = function(options){
  var session = options.session
      user = options.user,
      socket = options.socket;

  var socketSession = this._sessions[session._id];
  if (!socketSession){
    socketSession = new SocketSession({
      session: session
    });
    this._sessions[session._id] = socketSession
  }
  socketSession.join({
    user: user,
    socket: socket
  });
}

SessionManager.prototype.disconnect = function(options){
  var socket = options.socket;

  var session;
  Object.keys(this._sessions).some(function(sessionId){
    var socketSession = this._sessions[sessionId];
    if (socketSession.hasSocket(socket)){
      session = socketSession;
      return true;
    }
  }, this);

  if (session){
    session.leave(socket);
  } else {
    console.log('!!! no session found on disconnect')
  }

  return session;
}

// A dead session is a session with no connected to it
SessionManager.prototype.pruneDeadSessions = function(){
  this._sessions = this._sessions.filter(function(socketSession){
    return !socketSession.isDead();
  })
};

SessionManager.prototype.list = function(){
  var sessions = this._sessions;
  return Object.keys(sessions).map(function(id){
    return sessions[id].session;
  });
}

var sessionManager = new SessionManager();

module.exports = {
  create: function(options, cb){
    var user = options.user || {},
        userId = user._id,
        type = options.type;


    if (!userId){
      cb('Cannot create a session without a user id', null);
    } else if (user.isVolunteer){
      cb('Volunteers cannot create new sessions', null);
    } else if (!type){
      cb('Must provide a type for a new session', null);
    }

    var session = new Session({
      student: userId,
      type: type
    });

    session.save(cb);
  },

  // Return all current socket sessions as array
  getSocketSessions: function(){
    return sessionManager.list();
  },

  // Given a sessionId, create a socket session and join the session
  joinSession: function(options, cb){
    var sessionId = options.sessionId,
        user = options.user,
        socket = options.socket;

    Session.findOne({ _id: sessionId })
      .populate('student volunteer')
      .exec(function(err, session){
        if (err){
          return cb(err)
        } else if (!session){
          return cb('No session found!');
        }

        var addedSocket = sessionManager.connect({
          session: session,
          user: user,
          socket: socket
        });

        if (addedSocket){
          session.joinUser(user, function(err){
            if (err){
              sessionManager.disconnect({
                socket: socket
              });
            }
            cb(err, session);
          })
        }
      });
  },

  leaveSession: function(options, cb){
    var socket = options.socket;

    var session = sessionManager.disconnect({
      socket: socket
    });

    cb(null, session);
  },

  // Get list of all sessions that are not ended, with recent activity
  getRecentSessions: function(){

  }
};
