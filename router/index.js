var path = require('path');

module.exports = function(app){
  console.log('Initializing server routing');

  require('./auth')(app);
  // require('./api')(app);
};
