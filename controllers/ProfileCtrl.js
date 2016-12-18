var User = require('../models/User');

module.exports = {
  get: function(options, callback){
    var userId = options.userId;
    User.findById(userId, function(err, user){
      if (err){
        callback(new Error(err));
      } else {
        user.getProfile(callback);
      }
    });
  },
  update: function(options, callback){
    var userId = options.userId;

    var data = options.data || {};
        // fieldName = data.fieldName

    User.findByIdAndUpdate(userId, {
      biography: biography,
      tagline: tagline,
      location: location,
      coordinates: coordinates
    }, { new: true }, function(err, user){
      if (err){
        return callback(err);
      } else {
        user.getProfile(callback);
      }
    });
  },
};
