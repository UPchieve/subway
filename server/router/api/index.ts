import { Express, Router } from 'express'
import { PGStore } from 'connect-pg-simple'
import expressWs from 'express-ws'
import { Server } from 'socket.io'
import { authPassport } from '../../utils/auth-utils'
import { addLastActivity } from '../../middleware/add-last-activity'
import { addUserAction } from '../../middleware/add-user-action'
import { routeVolunteers } from './volunteers'
import { routeVerify } from './verify'
import { routeSession } from './session'
import { routeCalendar } from './calendar'
import { routeSockets } from './sockets'
import { routeModeration } from './moderate'
import { routePushToken } from './push-token'
import { routeReports } from './reports'
import { routeSurvey } from './survey'
import { routes as routeStats } from './stats'
import { routeTraining } from './training'
import { routeUser } from './user'
import { routeProductFlags } from './product-flags'
import { routeStudents } from './students'
import { routeSubjects } from './subjects'
import { routeProgressReports } from './progress-reports'
import { routeTeachers } from './teachers'
import { routeAdmin } from './admin'
import { routeWebhooks } from './webhooks'
import { sendReferralProgramEmail } from '../../services/MailService'
import { getUserReferralLink } from '../../models/User'
import config from '../../config'
import { routeVoiceMessages } from './voice-messages'
import { routeTutorBot } from './tutor-bot'
import { routeAssignments } from './assignments'
import { routeRewards } from './rewards'

export function routes(app: Express, sessionStore: PGStore, io: Server): void {
  const router: expressWs.Router = Router()

  routeVolunteers(router)
  routeTeachers(app, router)
  routeUser(router)
  routeVerify(router)
  routeSession(router as Router)
  routeVoiceMessages(router)
  routeCalendar(router)
  routeTraining(router)
  routeSockets(io, sessionStore)
  routeModeration(router)
  routePushToken(router)
  routeReports(router)
  routeSurvey(router)
  routeStats(router)
  routeProductFlags(router)
  routeStudents(router)
  routeSubjects(router)
  routeProgressReports(router)
  routeWebhooks(router)
  routeAdmin(app, router)
  routeTutorBot(router)
  routeAssignments(router)
  routeRewards(router)

  router.post('/send-referral-email', async function (req, res) {
    try {
      if (!req.user) {
        res.json({ success: false })
        return
      }
      const user = await getUserReferralLink(req.user.id)
      if (!user) {
        res.json({ success: false })
        return
      }

      const referralLink = `https://${config.client.host}/referral/${user.referralCode}`
      await sendReferralProgramEmail(user.email, user.firstName, referralLink)

      res.json({ success: true })
    } catch {
      res.json({ success: false })
    }
  })

  app.use(addLastActivity)
  app.use(addUserAction)
  app.use(
    '/api',
    authPassport.bypassMiddlewareForWebhooks(authPassport.isAuthenticated),
    router as Router
  )
}
