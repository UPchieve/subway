import multer from 'multer'
import { Express, Router } from 'express'
import { authPassport } from '../../utils/auth-utils'
import { resError } from '../res-error'
import { readCsvFromBuffer } from '../../utils/file-utils'
import * as CleverRosterService from '../../services/CleverRosterService'
import * as SchoolService from '../../services/SchoolService'
import { getPartnerSchools } from '../../services/SchoolService'
import {
  RosterStudentPayload,
  rosterPartnerStudents,
} from '../../services/UserCreationService'
import {
  asBoolean,
  asNumber,
  asOptional,
  asString,
  asUlid,
} from '../../utils/type-utils'

export function routeAdmin(app: Express, router: Router): void {
  const upload = multer()

  router.get('/schools', async function (req, res) {
    try {
      const payload = {
        name: asString(req.query.name),
        state: asString(req.query.state),
        city: asString(req.query.city),
        ncesId: asString(req.query.ncesId),
        isPartner: req.query.isPartner
          ? asBoolean(req.query.isPartner)
          : undefined,
        page: asNumber(req.query.page),
      }
      const result = await SchoolService.getSchools(payload)
      res.json(result)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/school/:schoolId', async function (req, res) {
    try {
      const schoolId = asUlid(req.params.schoolId)
      const school = await SchoolService.getSchool(schoolId)
      res.json({ school })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/schools/partner-schools', async function (_req, res) {
    try {
      const schools = await getPartnerSchools()
      res.send(schools)
    } catch (error) {
      resError(res, error)
    }
  })

  router.post(
    '/roster-students',
    upload.single('studentsFile'),
    async function (req, res) {
      try {
        if (!req.body.schoolId || !req.file) {
          res.status(500).json({
            err: 'Missing required data.',
          })
          return
        }
        const students = readCsvFromBuffer<RosterStudentPayload>(
          req.file.buffer,
          ['firstName', 'lastName', 'email', 'gradeLevel']
        )
        const { failed, updated } = await rosterPartnerStudents(
          students,
          req.body.schoolId
        )
        res.json({ failed, updated })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.post('/clever/roster', async function (req, res) {
    const districtId = asString(req.body.districtId)
    const cleverToUPchieveIds = req.body.cleverToUPchieveIds
      ? JSON.parse(req.body.cleverToUPchieveIds)
      : undefined

    if (!districtId) {
      res.status(422).json({
        err: 'Missing district id.',
      })
    }

    try {
      const report = await CleverRosterService.rosterDistrict(
        districtId,
        cleverToUPchieveIds
      )
      res.json({ report })
    } catch (error) {
      resError(res, error)
    }
  })

  app.use('/api/admin', authPassport.isAdmin, router)
}
