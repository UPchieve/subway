import { Express, Router, Response } from 'express'
import passport from 'passport'
import Sentry from '@sentry/node'
import { CustomError } from 'ts-custom-error'

import * as AuthService from '../../services/AuthService'
import {
  authPassport,
  RegistrationError,
  ResetError
} from '../../utils/auth-utils'
import { InputError, LookupError } from '../../utils/type-utils'
import config from '../../config'

// TODO: move this to a shared place
function resError(res: Response, err: CustomError, status?: number): void {
  if (status) {
    /* keep provided status */
  }
  // database lookup returned null
  else if (err instanceof LookupError) status = 409
  // business logic errors
  else if (err instanceof RegistrationError) status = 422
  else if (err instanceof ResetError) status = 422
  // bad input
  else if (err instanceof InputError) status = 422
  // unknown error
  else status = 500

  if (config.NODE_ENV === 'production' && status === 500)
    Sentry.captureException(err)

  res.status(status).json({
    err: err.message
  })
}

// TODO: type passport request member methods/variable correctly (login, logout, user)
export function routes(app: Express) {
  const router = Router()

  router.route('/logout').get(function(req, res) {
    req.session.destroy(() => {
      /* do nothing */
    })
    // @ts-expect-error
    req.logout()
    res.json({
      msg: 'You have been logged out'
    })
  })

  router.route('/login').post(
    // Delegate auth logic to passport middleware
    passport.authenticate('local'),
    // If successfully authed, return user object (otherwise 401 is returned from middleware)
    function(req, res) {
      // @ts-expect-error
      res.json({ user: req.user })
    }
  )

  router.route('/register/checkcred').post(async function(req, res) {
    try {
      const checked = await AuthService.checkCredential(req.body as unknown)
      return res.json({ checked })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/register/student').post(async function(req, res) {
    try {
      const student = await AuthService.registerStudent({
        ...req.body,
        ip: req.ip
      } as unknown)
      // @ts-expect-error
      await req.login(student)
      res.json({ user: student })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/register/volunteer/open').post(async function(req, res) {
    try {
      const volunteer = await AuthService.registerVolunteer({
        ...req.body,
        ip: req.ip
      } as unknown)
      // @ts-expect-error
      await req.login(volunteer)
      res.json({ user: volunteer })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/register/volunteer/partner').post(async function(req, res) {
    try {
      const volunteer = await AuthService.registerPartnerVolunteer({
        ...req.body,
        ip: req.ip
      } as unknown)
      // @ts-expect-error
      await req.login(volunteer)
      res.json({ user: volunteer })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/partner/volunteer').get(async function(req, res) {
    try {
      if (!req.query.hasOwnProperty('partnerId'))
        throw new InputError('Missing volunteerPartnerId query string')
      const partner = await AuthService.lookupPartnerVolunteer(
        req.query.partnerId as unknown
      )
      res.json({ volunteerPartner: partner })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/partner/student').get(async function(req, res) {
    try {
      if (!req.query.hasOwnProperty('partnerId'))
        throw new InputError('Missing studentPartnerId query string')
      const partner = await AuthService.lookupPartnerStudent(
        req.query.partnerId as unknown
      )
      res.json({ studentPartner: partner })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/partner/student/code').get(async function(req, res) {
    try {
      if (!req.query.hasOwnProperty('partnerSignupCode'))
        throw new InputError('Missing partnerSignupCode query string')
      const studentPartnerKey = await AuthService.lookupPartnerStudentCode(
        req.query.partnerSignupCode as unknown
      )
      res.json({ studentPartnerKey })
    } catch (err) {
      resError(res, err)
    }
  })

  router
    .route('/partner/student-partners')
    .all(authPassport.isAdmin)
    .get(async function(req, res) {
      try {
        const partnerOrgs = await AuthService.lookupStudentPartners()
        res.json({ partnerOrgs })
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/partner/volunteer-partners')
    .all(authPassport.isAdmin)
    .get(async function(req, res) {
      try {
        const partnerOrgs = await AuthService.lookupVolunteerPartners()
        res.json({ partnerOrgs })
      } catch (err) {
        resError(res, err)
      }
    })

  router.route('/reset/send').post(async function(req, res) {
    try {
      if (!req.body.hasOwnProperty('email'))
        throw new InputError('Missing email body string')
      await AuthService.sendReset(req.body.email as unknown)
    } catch (err) {
      // do not respond with info about no email match
      if (!(err instanceof LookupError)) return resError(res, err) // will handle sending response with status/error
    }
    res.status(200).json({
      msg:
        'If an account with this email address exists then we will send a password reset email'
    })
  })

  router.route('/reset/confirm').post(async function(req, res) {
    try {
      await AuthService.confirmReset(req.body as unknown)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/auth', router)
}