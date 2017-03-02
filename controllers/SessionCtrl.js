var Q = require('q');

var Session = require('../models/Session');

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

  joinSession: function(options, cb){
    var sessionId = options.sessionId,
        user = options.user;

    Session.findOne({ _id: sessionId })
      .populate('student volunteer')
      .exec(function(err, session){
        console.log(session);
        if (user.isVolunteer){
          session.volunteer = user;
        } else {
          session.student = user;
        }
        session.save(cb);
      });
  },

  // Get list of all sessions that are not ended, with recent activity
  getRecentSessions: function(){

  }
};
