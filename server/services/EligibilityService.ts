import * as UserCtrl from '../controllers/UserCtrl'
import { getSchoolById } from '../models/School/queries'
import { getZipCodeByZipCode } from '../models/ZipCode/queries'
import {
  getIneligibleStudentByEmail,
  insertIneligibleStudent,
} from '../models/IneligibleStudent/queries'
import { getUserIdByEmail } from '../models/User/queries'
import { asFactory, asString, asEnum, asOptional } from '../utils/type-utils'
import { GRADES } from '../constants'
import { CustomError } from 'ts-custom-error'
import { School } from '../models/School'
import { ZipCode } from '../models/ZipCode'
import config from '../config'
import { InputError } from '../models/Errors'

type CheckEligibilityPayload = {
  email: string
  gradeLevel?: GRADES
  referredByCode?: string
  schoolId?: string
  zipCode: string
  // == Remove after midtown clean-up.
  currentGrade?: GRADES
  schoolUpchieveId?: string
}
const asCheckEligibilityPayload = asFactory<CheckEligibilityPayload>({
  email: asString,
  gradeLevel: asOptional(asEnum(GRADES)),
  referredByCode: asOptional(asString),
  schoolId: asOptional(asString),
  zipCode: asString,
  // == Remove after midtown clean-up.
  currentGrade: asOptional(asEnum(GRADES)),
  schoolUpchieveId: asOptional(asString),
})

type CheckEligibilityResponse = {
  message?: string
  isEligible: boolean
  isCollegeStudent?: boolean
  isExistingUser?: boolean
}

export class ExistingUserError extends CustomError {}

export async function checkEligibility(
  ip: string,
  payload: unknown
): Promise<CheckEligibilityResponse> {
  const {
    email,
    gradeLevel,
    referredByCode,
    schoolId,
    zipCode: zipCodeInput,
    // == Remove after midtown clean-up.
    currentGrade,
    schoolUpchieveId,
  } = asCheckEligibilityPayload(payload)

  if (email) {
    const existingUser = await getUserIdByEmail(email)
    if (existingUser) return { isExistingUser: true, isEligible: true }
  }

  // == Remove after midtown clean-up.
  const isCollegeStudent =
    gradeLevel === GRADES.COLLEGE || currentGrade === GRADES.COLLEGE

  if (email) {
    const existingIneligible = await getIneligibleStudentByEmail(email)
    if (existingIneligible) {
      return { isEligible: false, isCollegeStudent }
    }
  }

  // == Remove after midtown clean-up.
  const school =
    schoolId || schoolUpchieveId
      ? await getSchoolById(schoolId ?? schoolUpchieveId ?? '')
      : undefined
  const zipCode = zipCodeInput
    ? await getZipCodeByZipCode(zipCodeInput)
    : undefined
  if (zipCodeInput && !zipCode) {
    throw new InputError('You must enter a valid United States zip code.')
  }

  const isEligibleBySchool = isSchoolApproved(school)
  const isEligibleByZipCode = isZipCodeEligible(zipCode)
  const isStudentEligible =
    (isEligibleBySchool || isEligibleByZipCode) && !isCollegeStudent

  if (!isStudentEligible) {
    const referredBy = await UserCtrl.checkReferral(referredByCode)
    if (email) {
      await insertIneligibleStudent(
        email,
        school?.id,
        zipCodeInput,
        // == Remove after midtown clean-up
        gradeLevel ?? currentGrade,
        referredBy,
        ip
      )
    }
  }

  return {
    isEligible: isStudentEligible,
    isCollegeStudent,
  }
}

export async function verifyEligibility(
  zipCode?: string,
  schoolUpchieveId?: string
) {
  const school = schoolUpchieveId
    ? await getSchoolById(schoolUpchieveId)
    : undefined
  const zipCodeData = zipCode ? await getZipCodeByZipCode(zipCode) : undefined
  return isSchoolApproved(school) || isZipCodeEligible(zipCodeData)
}

export async function checkZipCode(param: unknown): Promise<boolean> {
  const zipCode = asString(param)
  const foundZip = await getZipCodeByZipCode(zipCode)
  return !!foundZip
}

function isZipCodeEligible(zipCode?: ZipCode) {
  return !!zipCode && zipCode.isEligible
}

export function isSchoolApproved(school?: School) {
  return (
    !!school &&
    (school.isAdminApproved ||
      school.isPartner ||
      isNewSchoolEligibilityApproved())
  )

  function isNewSchoolEligibilityApproved() {
    return (
      isTitle1Eligible() ||
      hasCEONationalSchoolLunch() ||
      hasFreeReducedLunchAboveThreshold(config.eligibleFRLThreshold)
    )
  }

  /*
   * The following are the options for title1SchoolStatus column. Only 3, 4, 5 are eligible.
   * 1-Title I targeted assistance eligible school-No program
   * 2-Title I targeted assistance school
   * 3-Title I schoolwide eligible-Title I targeted assistance program
   * 4-Title I schoolwide eligible-No program
   * 5-Title I schoolwide school
   * 6-Not a Title I school
   */
  function isTitle1Eligible() {
    return (
      school?.isSchoolWideTitle1 ||
      school?.title1SchoolStatus?.startsWith('3') ||
      school?.title1SchoolStatus?.startsWith('4') ||
      school?.title1SchoolStatus?.startsWith('5')
    )
  }

  function hasCEONationalSchoolLunch() {
    return (
      school?.nationalSchoolLunchProgram ===
      'Yes under Community Eligibility Option (CEO)'
    )
  }

  function hasFreeReducedLunchAboveThreshold(thresholdPercentage: number) {
    if (!school || !school.totalStudents) {
      return false
    }
    const freeReducedLunchStudents = Math.max(
      school?.nslpDirectCertification ?? 0,
      school?.frlEligible ?? 0
    )
    return freeReducedLunchStudents / school.totalStudents > thresholdPercentage
  }
}
