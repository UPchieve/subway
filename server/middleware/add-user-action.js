const UserActionCtrl = require('../controllers/UserActionCtrl')
const Sentry = require('@sentry/node')

function addUserAction(req, res, next) {
  if (req.user) {
    const { _id } = req.user
    const { ip: ipAddress } = req

    if (req.url === '/api/calendar/save') {
      UserActionCtrl.updatedAvailability(_id, ipAddress).catch(error =>
        Sentry.captureException(error)
      )
    }

    if (req.url === '/api/training/questions') {
      const { category } = req.body
      UserActionCtrl.startedQuiz(_id, category, ipAddress).catch(error =>
        Sentry.captureException(error)
      )
    }

    // add user action 'updated profile' only from /profile request route
    const referer = req.headers.referer
    if (
      req.url === '/api/user' &&
      req.method === 'PUT' &&
      referer.includes('profile')
    ) {
      UserActionCtrl.updatedProfile(_id, ipAddress).catch(error =>
        Sentry.captureException(error)
      )
    }
  }

  next()
}

module.exports = addUserAction
