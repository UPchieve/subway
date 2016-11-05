var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },

  profileId: String,

  name: {
    type: String,
    default: ''
  },
  picture: {
    type: String,
    default: ''
  },
  isTutor: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

});

};

module.exports = mongoose.model('User', userSchema);
