var mongoose = require('mongoose');

var validTypes = [
  'Math', 'Counseling'
];

var sessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // TODO: validate isVolunteer: false
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // TODO: validate isVolunteer: true
  },
  type: {
    type: String,
    validate: {
      validator: function(v){
        var type = v.toLowerCase();
        return validTypes.some(function(validType){
          return validType.toLowerCase() === type;
        });
      },
      message: '{VALUE} is not a valid type'
    }
  },

  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Messages'
  }],
  // whiteboardImg: Buffer,


  createdAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  }

  // Scheduled sessions
  // startAt: {
  //   type: Date,
  //   default: Date.now
  // }

});

sessionSchema.methods.saveMessage = function(messageObj, cb){

};

//
sessionSchema.methods.joinUser = function(user, cb){
  if (user.isVolunteer){
    this.volunteer = user;
  } else {
    this.student = user;
  }
  this.save(cb);

};

sessionSchema.methods.leaveUser = function(user, cb){
  if (user.isVolunteer){
    this.volunteer = null;
  } else {
    this.student = null;
  }
  this.save(cb);
};

sessionSchema.methods.isActive = function(cb){

};


sessionSchema.methods.isWaiting = function(cb){

};

module.exports = mongoose.model('Session', sessionSchema);
