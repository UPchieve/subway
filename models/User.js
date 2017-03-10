var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var validator = require('validator');

var config = require('../config.js');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v){
        return validator.isEmail(v);
      },
      message: '{VALUE} is not a valid email'
    }
  },
  password: String,

  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  registrationCode: String,

  // Profile data
  firstname: String,
  lastname: String,
  serviceInterests: [String],
  picture: String,
  year: Number,
  month: Number,
  day: Number,
  gender: String,
  race: [String],
  groupIdentification: [String],
  computerAccess: [String],
  preferredTimes: [String],

  // User status
  isVolunteer: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

// Given a user record, strip out sensitive data for public consumption
userSchema.methods.parseProfile = function(){
  return {
    _id: this._id,
    email: this.email,
    verified: this.verified,
    firstname: this.firstname,
    lastname: this.lastname,
    picture: this.picture,
    isVolunteer: this.isVolunteer,
    isAdmin: this.isAdmin,
    createdAt: this.createdAt,

    day: this.day,
    month: this.month,
    year: this.year,
    serviceInterests: this.serviceInterests,
    gender: this.gender,
    race: this.race,
    groupIdentification: this.groupIdentification,
    computerAccess: this.computerAccess,
    preferredTimes: this.preferredTimes
  };
};

// Placeholder method to support asynchronous profile parsing
userSchema.methods.getProfile = function(cb){
  cb(null, this.parseProfile());
};

userSchema.methods.hashPassword = function(password, cb){
  bcrypt.genSalt(config.saltRounds, function(err, salt){
    if (err){
      cb(err);
    } else {
      bcrypt.hash(password, salt, cb);
    }
  });
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

// Static method to determine if a registration code is valid
userSchema.statics.checkCode = function(code, cb){
  var studentCodes = [
    'UPBOUND', 'UPCHIEVE2017'
  ];

  var volunteerCodes = [
    'VOLUNTEER2017'
  ];

  var isStudentCode = studentCodes.some(function(studentCode){
    return studentCode.toUpperCase() === code.toUpperCase();
  });
  var isVolunteerCode = volunteerCodes.some(function(volunteerCode){
    return volunteerCode.toUpperCase() === code.toUpperCase();
  });

  if (isStudentCode || isVolunteerCode){
    cb(null, {
      studentCode: isStudentCode,
      volunteerCode: isVolunteerCode
    });
  } else {
    cb('Registration code is invalid', false);
  }
}

module.exports = mongoose.model('User', userSchema);
