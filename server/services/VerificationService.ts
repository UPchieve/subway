import { Ulid } from '../models/pgUtils'
import { VERIFICATION_METHOD, VERIFICATION_TYPE } from '../constants'
import {
  asBoolean,
  asEnum,
  asFactory,
  asOptional,
  asString,
} from '../utils/type-utils'
import isValidEmail from '../utils/is-valid-email'
import {
  AlreadyInUseError,
  InputError,
  LookupError,
  SmsVerificationDisabledError,
  TwilioError,
} from '../models/Errors'
import * as StudentService from './StudentService'
import * as MailService from './MailService'
import * as TwilioService from './TwilioService'
import {
  getUserIdByEmail,
  getUserIdByPhone,
  updateUserProxyEmail,
  updateUserVerifiedInfoById,
} from '../models/User/queries'
import isValidInternationalPhoneNumber from '../utils/is-valid-international-phone-number'
import { getSmsVerificationFeatureFlag } from './FeatureFlagService'
import * as UserService from './UserService'

export interface InitiateVerificationData {
  userId: Ulid
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  firstName: string
  verificationType?: VERIFICATION_TYPE
}

const asInitiateVerificationData = asFactory<InitiateVerificationData>({
  userId: asString,
  sendTo: asString,
  verificationMethod: asEnum(VERIFICATION_METHOD),
  firstName: asString,
  verificationType: asOptional(asEnum(VERIFICATION_TYPE)),
})

export interface ConfirmVerificationData {
  userId: Ulid
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  verificationCode: string
  forSignup?: boolean
  verificationType?: VERIFICATION_TYPE
}

const asConfirmVerificationData = asFactory<ConfirmVerificationData>({
  userId: asString,
  sendTo: asString,
  verificationMethod: asEnum(VERIFICATION_METHOD),
  verificationCode: asString,
  forSignup: asOptional(asBoolean),
  verificationType: asOptional(asEnum(VERIFICATION_TYPE)),
})

// We're gradually refactoring to use `verificationType` for clearer logic.
// For backward compatibility, if verificationType is not provided, we use the verificationMethod directly
function getVerificationMethod(
  verificationType?: VERIFICATION_TYPE,
  verificationMethod?: VERIFICATION_METHOD
): VERIFICATION_METHOD {
  if (!verificationType && !verificationMethod)
    throw new Error('Verification type or verification method must be provided')
  if (!verificationType && verificationMethod) return verificationMethod

  switch (verificationType) {
    case VERIFICATION_TYPE.PHONE_NUMBER:
      return VERIFICATION_METHOD.SMS
    case VERIFICATION_TYPE.EMAIL_FOR_SIGNUP:
    case VERIFICATION_TYPE.EMAIL_FOR_PROXY_EMAIL:
    case VERIFICATION_TYPE.EMAIL_FOR_EMAIL:
      return VERIFICATION_METHOD.EMAIL
    default:
      throw new Error('Unknown verification type')
  }
}

export async function initiateVerification(data: unknown): Promise<void> {
  const {
    userId,
    sendTo,
    verificationMethod: initialVerificationMethod,
    verificationType,
    firstName,
  } = asInitiateVerificationData(data)

  const verificationMethod = getVerificationMethod(
    verificationType,
    initialVerificationMethod
  )
  if (
    verificationMethod === VERIFICATION_METHOD.SMS &&
    !(await getSmsVerificationFeatureFlag(userId))
  ) {
    throw new SmsVerificationDisabledError()
  }

  const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS
  let existingUserErrorMessage: string
  let existingUserId: Ulid | undefined

  if (isPhoneVerification) {
    if (!isValidInternationalPhoneNumber(sendTo))
      throw new InputError('Must supply a valid phone number')

    existingUserErrorMessage = 'The phone number you entered is already in use'
    existingUserId = await getUserIdByPhone(sendTo)
  } else {
    // email verification
    if (!isValidEmail(sendTo))
      throw new InputError('Must supply a valid email address')

    existingUserErrorMessage = 'The email address you entered is already in use'
    existingUserId = await getUserIdByEmail(sendTo)

    if (
      // TODO: Refactor so that we only need to check against EMAIL_FOR_SIGNUP
      verificationType !== VERIFICATION_TYPE.EMAIL_FOR_PROXY_EMAIL &&
      verificationType !== VERIFICATION_TYPE.EMAIL_FOR_EMAIL &&
      !existingUserId
    ) {
      throw new LookupError(
        'The email address you entered does not match your account email address'
      )
    }
  }

  // Make sure the user from DB matches the one in the request
  if (existingUserId && !(userId === existingUserId))
    throw new AlreadyInUseError(existingUserErrorMessage)

  try {
    await TwilioService.sendVerification(
      sendTo,
      verificationMethod,
      firstName,
      userId
    )
  } catch (err) {
    const error = err as {
      message: string
      status: number
    }
    throw new TwilioError(
      error.message ?? 'Could not send verification',
      error.status
    )
  }
}

async function sendOnboardingEmails(userId: Ulid): Promise<void> {
  const user = await UserService.getUserContactInfo(userId)
  if (!user) return

  if (user.roleContext.isActiveRole('volunteer')) {
    if (user.volunteerPartnerOrg) {
      await MailService.sendPartnerVolunteerWelcomeEmail(
        user.email,
        user.firstName
      )
    } else {
      await MailService.sendOpenVolunteerWelcomeEmail(
        user.email,
        user.firstName
      )
    }
  } else if (user.roleContext.isActiveRole('student')) {
    await MailService.sendStudentOnboardingWelcomeEmail(
      user.email,
      user.firstName
    )
    await StudentService.queueOnboardingEmails(user.id)
  } else if (user.roleContext.isActiveRole('teacher')) {
    await MailService.sendTeacherOnboardingWelcomeEmail(
      user.email,
      user.firstName
    )
  }
}

export async function confirmVerification(data: unknown): Promise<boolean> {
  const {
    userId,
    sendTo,
    verificationMethod: initialVerificationMethod,
    verificationCode,
    forSignup,
    verificationType,
  } = asConfirmVerificationData(data)

  const verificationMethod = getVerificationMethod(
    verificationType,
    initialVerificationMethod
  )
  if (
    verificationMethod === VERIFICATION_METHOD.SMS &&
    !(await getSmsVerificationFeatureFlag(userId))
  ) {
    throw new SmsVerificationDisabledError()
  }

  // Validate code
  const VERIFICATION_CODE_LENGTH = 6
  if (
    verificationCode.length !== VERIFICATION_CODE_LENGTH ||
    isNaN(Number(verificationCode))
  )
    throw new InputError('Must enter a valid 6-digit validation code')

  const shouldSendOnboardingEmails = forSignup ?? true
  const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS

  let isVerified: boolean = false
  try {
    isVerified = await TwilioService.confirmVerification(
      sendTo,
      verificationCode
    )
  } catch (err) {
    const error = err as {
      message: string
      status: number
    }
    throw new TwilioError(
      error.message ?? 'Could not confirm verification code',
      error.status ?? 500
    )
  }

  if (isVerified) {
    if (verificationType === VERIFICATION_TYPE.EMAIL_FOR_PROXY_EMAIL)
      await updateUserProxyEmail(userId, sendTo)
    else await updateUserVerifiedInfoById(userId, sendTo, isPhoneVerification)
    if (shouldSendOnboardingEmails) {
      await sendOnboardingEmails(userId)
    }
  }

  return isVerified
}
