import expressWs from '@small-tech/express-ws'

const passport = require('../auth/passport')
const ReportService = require('../../services/ReportService')

export function routeReports(router: expressWs.Router): void {
  router.get('/reports/session-report', passport.isAdmin, async function(
    req,
    res,
    next
  ) {
    try {
      const sessions = await ReportService.sessionReport(req.query)
      res.json({ sessions })
    } catch (error) {
      next(error)
    }
  })

  router.get('/reports/usage-report', passport.isAdmin, async function(
    req,
    res,
    next
  ) {
    try {
      const students = await ReportService.usageReport(req.query)
      res.json({ students })
    } catch (error) {
      next(error)
    }
  })

  router.get(
    '/reports/volunteer-partner-report',
    passport.isAdmin,
    async function(req, res, next) {
      try {
        const data = await ReportService.generateVolunteerPartnerReport(
          req.query
        )
        res.json({ data })
      } catch (error) {
        next(error)
      }
    }
  )
}