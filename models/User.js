var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,

  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,

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

userSchema.methods.parseProfile = function(){
  return {
    _id: this._id,
    email: this.email,
    verified: this.verified
  };
};

userSchema.methods.getProfile = function(cb){
  cb(null, this.parseProfile());
};

userSchema.methods.verifyPassword = function(candidatePassword, cb){
  var user = this;

  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err){
      return cb(err);
    } else if (isMatch){
      return cb(null, user);
    } else {
      cb(null, false);
    }
  });
};

module.exports = mongoose.model('User', userSchema);
