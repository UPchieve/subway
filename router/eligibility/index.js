const express = require('express')
const passport = require('../auth/passport')
const Sentry = require('@sentry/node')
const SchoolService = require('../../services/SchoolService')
const UserService = require('../../services/UserService')
const UserCtrl = require('../../controllers/UserCtrl')
const School = require('../../models/School')
const ZipCode = require('../../models/ZipCode')
const IneligibleStudent = require('../../models/IneligibleStudent')
const IneligibleStudentService = require('../../services/IneligibleStudentService')

module.exports = function(app) {
  const router = new express.Router()

  // Check if a student is eligible
  router.route('/check').post(async function(req, res, next) {
    const {
      schoolUpchieveId,
      zipCode: zipCodeInput,
      email,
      referredByCode
    } = req.body

    const existingUser = await UserService.getUser({ email })
    if (existingUser)
      return res.status(422).json({
        message: 'Email already in use'
      })

    const existingIneligible = await IneligibleStudentService.getStudent({
      email
    })
    if (existingIneligible) return res.json({ isEligible: false })

    const schoolFetch = School.findByUpchieveId(schoolUpchieveId).exec()
    const zipCodeFetch = ZipCode.findByZipCode(zipCodeInput).exec()

    try {
      const [school, zipCode] = await Promise.all([schoolFetch, zipCodeFetch])
      const isSchoolApproved = school.isApproved
      const isZipCodeEligible = zipCode && zipCode.isEligible
      const isStudentEligible = isSchoolApproved || isZipCodeEligible

      if (!isStudentEligible) {
        const referredBy = await UserCtrl.checkReferral(referredByCode)
        const newIneligibleStudent = new IneligibleStudent({
          email,
          zipCode: zipCodeInput,
          school: school._id,
          ipAddress: req.ip,
          referredBy
        })

        newIneligibleStudent.save()
      }

      return res.json({ isEligible: isStudentEligible })
    } catch (err) {
      next(err)
    }
  })

  router.route('/school/search').get(async (req, res, next) => {
    const { q } = req.query

    try {
      const results = await SchoolService.search(q)
      res.json({
        results: results
      })
    } catch (error) {
      next(error)
    }
  })

  // Paginate eligible high schools (admins only)
  router
    .route('/school/findeligible')
    .all(passport.isAdmin)
    .get(function(req, res, next) {
      School.find(
        {
          isApproved: true
        },
        null,
        {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip)
        }
      )
        .exec()
        .then(eligibleSchools => {
          res.json({ eligibleSchools })
        })
        .catch(err => next(err))
    })

  // List all students registered with a school (admins only)
  router
    .route('/school/studentusers/:schoolUpchieveId')
    .all(passport.isAdmin)
    .get(function(req, res, next) {
      const upchieveId = req.params.schoolUpchieveId

      School.findByUpchieveId(upchieveId)
        .populate('studentUsers')
        .exec(function(err, school) {
          if (err) {
            next(err)
          } else {
            res.json({
              upchieveId: school.upchieveId,
              studentUsers: school.studentUsers.map(user => {
                return {
                  email: user.email,
                  firstname: user.firstname,
                  lastname: user.lastname,
                  userId: user._id
                }
              })
            })
          }
        })
    })

  router.get('/school/:schoolId', passport.isAdmin, async function(
    req,
    res,
    next
  ) {
    const { schoolId } = req.params

    try {
      const school = await SchoolService.getSchool(schoolId)
      res.json({ school })
    } catch (err) {
      console.log(err)
      next(err)
    }
  })
  router.put('/school/:schoolId', passport.isAdmin, async function(
    req,
    res,
    next
  ) {
    const { schoolId } = req.params

    try {
      await SchoolService.adminUpdateSchool({ schoolId, ...req.body })
      res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  })

  router.get('/schools', passport.isAdmin, async function(req, res, next) {
    try {
      const { schools, isLastPage } = await SchoolService.getSchools(req.query)
      res.json({ schools, isLastPage })
    } catch (err) {
      next(err)
    }
  })

  router.post('/school/new', passport.isAdmin, async function(req, res, next) {
    try {
      const school = await SchoolService.createSchool(req.body)
      res.json({ schoolId: school._id })
    } catch (err) {
      next(err)
    }
  })

  router.post('/school/approval', passport.isAdmin, async function(req, res) {
    const { schoolId, isApproved } = req.body

    try {
      await SchoolService.updateApproval(schoolId, isApproved)
      res.sendStatus(200)
    } catch (err) {
      Sentry.captureException(err)
      res.sendStatus(500)
    }
  })

  router.get('/ineligible-students', passport.isAdmin, async function(
    req,
    res,
    next
  ) {
    const page = parseInt(req.query.page) || 1

    try {
      const {
        ineligibleStudents,
        isLastPage
      } = await IneligibleStudentService.getStudents(page)

      res.json({ ineligibleStudents, isLastPage })
    } catch (err) {
      next(err)
    }
  })

  router.get('/zip-codes/:zipCode', passport.isAdmin, async function(req, res) {
    const { zipCode } = req.params

    try {
      const result = await ZipCode.findByZipCode(zipCode).exec()
      if (!result) res.sendStatus(404)
      else
        res.json({
          zipCode: { ...result.toObject(), isEligible: result.isEligible }
        })
    } catch (err) {
      Sentry.captureException(err)
      res.sendStatus(500)
    }
  })

  app.use('/api-public/eligibility', router)
}
