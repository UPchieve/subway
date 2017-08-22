var CalendarCtrl = require('../../controllers/CalendarCtrl');

module.exports = function(router){
	router.post('/calendar/init', function(req, res){
    CalendarCtrl.initAvailability({userid: req.body.userid}, function(err){
			if (err){
				res.json({err: err});
			} else {
				res.json({
          msg: 'Availability initialized'
        });
			}
		});
  });
  router.post('/calendar/get', function(req, res){
    CalendarCtrl.getAvailability({userid: req.body.userid}, function(err, availability){
			if (err){
				res.json({err: err});
			} else {
				res.json({
          msg: 'Availability retrieved',
          availability: availability
        });
			}
		});
  });
  router.post('/calendar/save', function(req, res){
    console.log('reached router');
    CalendarCtrl.getAvailability({userid: req.body.userid, availability: req.body.availability}, function(err, availability){
      console.log('inside controller call');
      if (err){
        console.log(err);
				res.json({err: err});
			} else {
        console.log('did not get error in router');
				res.json({
          msg: 'Availability saved'
        });
			}
		});
  });
};
