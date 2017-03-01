var Session = require('../models/Session');

module.exports = {
  create: function(options, cb){
    var user = options.user || {},
        userId = user.userId,
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

  getSession: function(options, cb){
    var sessionId = options.sessionId;

    Session.findById(sessionId, function(err, session){
      Session.populate(session, function(err, populatedSession){

      });
    });
  },

  // Get list of all sessions that are not ended, with recent activity
  getRecentSessions: function(){

  }
};
