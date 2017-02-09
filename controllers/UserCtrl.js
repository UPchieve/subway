var User = require('../models/User');

module.exports = {
  get: function(options, callback){
    var userId = options.userId;
    User.findById(userId, function(err, user){
      if (err || !user){
        callback('Could not get user');
      } else {
        user.getProfile(callback);
      }
    });
  },
  update: function(options, callback){
    var userId = options.userId;

    var data = options.data || {},
        name = data.name,
        picture = data.picture,
        update = {};

    if (name){
      update.name = name;
    }
    if (picture){
      update.picture = picture;
    }

    User.findByIdAndUpdate(userId, update, { new: true }, function(err, user){
      if (err){
        return callback(err);
      } else {
        user.getProfile(callback);
      }
    });
  },
};
