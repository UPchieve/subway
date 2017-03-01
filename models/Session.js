var mongoose = require('mongoose');

// var config = require('../config/server.js');

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
        'use strict';
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
  'use strict';
  
};

module.exports = mongoose.model('Session', sessionSchema);
