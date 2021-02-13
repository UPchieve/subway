import errcode from 'err-code'
import promiseRetry from 'promise-retry'
import Vue from 'vue'
import config from '../config'

const AUTH_ROOT = `${config.serverRoot}/auth`
const API_ROOT = `${config.serverRoot}/api`
const ELIGIBILITY_API_ROOT = `${config.serverRoot}/api-public/eligibility`
const CONTACT_API_ROOT = `${config.serverRoot}/api-public/contact`
const REFERENCE_API_ROOT = `${config.serverRoot}/api-public/reference`
const REFERRAL_API_ROOT = `${config.serverRoot}/api-public/referral`
const WHITEBOARD_ROOT = `${config.serverRoot}/whiteboard`

const FAULT_TOLERANT_HTTP_TIMEOUT = 10000
const FAULT_TOLERANT_HTTP_MAX_RETRY_TIMEOUT = 100000
const FAULT_TOLERANT_HTTP_MAX_RETRIES = 10

export default {
  _successHandler(res) {
    return Promise.resolve(res)
  },
  _errorHandler(res) {
    return Promise.reject(res)
  },
  _faultTolerantHttp(http, method, onRetry, url, data) {
    const promiseToRetry = () => {
      return (['get', 'delete', 'head', 'jsonp'].indexOf(method) !== -1
        ? http[method](url, {
            timeout: FAULT_TOLERANT_HTTP_TIMEOUT
          })
        : http[method](url, data, {
            timeout: FAULT_TOLERANT_HTTP_TIMEOUT
          })
      ).then(this._successHandler, this._errorHandler)
    }

    // object property specifying whether this function is aborted
    const requestState = { isAborted: false }

    return promiseRetry(
      retry => {
        if (requestState.isAborted) {
          // early exit
          throw errcode(new Error('Aborted by user'), 'EUSERABORTED')
        }

        return promiseToRetry().catch(res => {
          if (res.status === 0) {
            if (onRetry) {
              onRetry(res, () => {
                requestState.isAborted = true
              })
            }
            retry(res)
          }

          throw res
        })
      },
      {
        retries: FAULT_TOLERANT_HTTP_MAX_RETRIES,
        maxTimeout: FAULT_TOLERANT_HTTP_MAX_RETRY_TIMEOUT
      }
    )
  },

  // Server route defintions
  login(context, data) {
    return context.$http
      .post(`${AUTH_ROOT}/login`, data)
      .then(this._successHandler, this._errorHandler)
  },
  logout(context) {
    return context.$http
      .get(`${AUTH_ROOT}/logout`)
      .then(this._successHandler, this._errorHandler)
  },
  checkRegister(context, data) {
    return context.$http
      .post(`${AUTH_ROOT}/register/checkcred`, data)
      .then(this._successHandler, this._errorHandler)
  },
  checkStudentPartnerSignupCode(partnerSignupCode) {
    return Vue.http
      .get(
        `${AUTH_ROOT}/partner/student/code?partnerSignupCode=${encodeURIComponent(
          partnerSignupCode
        )}`
      )
      .then(this._successHandler, this._errorHandler)
  },
  getVolunteerPartner(partnerId) {
    return Vue.http
      .get(
        `${AUTH_ROOT}/partner/volunteer?partnerId=${encodeURIComponent(
          partnerId
        )}`
      )
      .then(this._successHandler, this._errorHandler)
  },
  getStudentPartner(partnerId) {
    return Vue.http
      .get(
        `${AUTH_ROOT}/partner/student?partnerId=${encodeURIComponent(
          partnerId
        )}`
      )
      .then(this._successHandler, this._errorHandler)
  },
  registerOpenVolunteer(context, data) {
    return context.$http
      .post(`${AUTH_ROOT}/register/volunteer/open`, data)
      .then(this._successHandler, this._errorHandler)
  },
  registerPartnerVolunteer(context, data) {
    return context.$http
      .post(`${AUTH_ROOT}/register/volunteer/partner`, data)
      .then(this._successHandler, this._errorHandler)
  },
  registerStudent(context, data) {
    return context.$http
      .post(`${AUTH_ROOT}/register/student`, data)
      .then(this._successHandler, this._errorHandler)
  },
  sendReset(context, data) {
    return context.$http
      .post(`${AUTH_ROOT}/reset/send`, data)
      .then(this._successHandler, this._errorHandler)
  },
  confirmReset(context, data) {
    return context.$http
      .post(`${AUTH_ROOT}/reset/confirm`, data)
      .then(this._successHandler, this._errorHandler)
  },
  verifyReset(context, data) {
    return context.$http
      .post(`${AUTH_ROOT}/reset/verify`, data)
      .then(this._successHandler, this._errorHandler)
  },
  user(context) {
    return context.$http
      .get(`${API_ROOT}/user`)
      .then(this._successHandler, this._errorHandler)
  },
  userGlobal() {
    return Vue.http
      .get(`${API_ROOT}/user`)
      .then(this._successHandler, this._errorHandler)
  },
  sendVerification(context) {
    return context.$http
      .post(`${API_ROOT}/verify/send`)
      .then(this._successHandler, this._errorHandler)
  },
  confirmVerification(context, data) {
    return context.$http
      .post(`${API_ROOT}/verify/confirm`, data)
      .then(this._successHandler, this._errorHandler)
  },
  sendContact(context, data) {
    return context.$http
      .post(`${CONTACT_API_ROOT}/send`, data)
      .then(this._successHandler, this._errorHandler)
  },
  setProfile(data) {
    return Vue.http
      .put(`${API_ROOT}/user`, data)
      .then(this._successHandler, this._errorHandler)
  },
  getVolunteersAvailability(context, data) {
    return context.$http
      .get(`${API_ROOT}/volunteers/availability/${data}`)
      .then(this._successHandler, this._errorHandler)
  },
  getVolunteers(context) {
    return context.$http
      .get(`${API_ROOT}/volunteers`)
      .then(this._successHandler, this._errorHandler)
  },
  getReferredFriends() {
    return Vue.http
      .get(`${API_ROOT}/user/referred-friends`)
      .then(this._successHandler, this._errorHandler)
  },
  getReferredBy(referralCode) {
    return Vue.http
      .get(`${REFERRAL_API_ROOT}/${referralCode}`)
      .then(this._successHandler, this._errorHandler)
  },
  newSession(context, data, onRetry) {
    return this._faultTolerantHttp(
      context.$http,
      'post',
      onRetry,
      `${API_ROOT}/session/new`,
      data
    )
  },
  endSession(context, data) {
    return context.$http
      .post(`${API_ROOT}/session/end`, data)
      .then(this._successHandler, this._errorHandler)
  },
  checkSession(context, data, onRetry) {
    return this._faultTolerantHttp(
      context.$http,
      'post',
      onRetry,
      `${API_ROOT}/session/check`,
      data
    )
  },
  currentSession(context, data) {
    return context.$http
      .post(`${API_ROOT}/session/current`, data)
      .then(this._successHandler, this._errorHandler)
  },
  latestSession(context, data) {
    return context.$http
      .post(`${API_ROOT}/session/latest`, data)
      .then(this._successHandler, this._errorHandler)
  },
  getSession(sessionId) {
    return Vue.http
      .get(`${API_ROOT}/session/${sessionId}`)
      .then(this._successHandler, this._errorHandler)
  },
  reportSession({ sessionId, reportReason, reportMessage }) {
    return Vue.http
      .post(`${API_ROOT}/session/${sessionId}/report`, {
        reportReason,
        reportMessage
      })
      .then(this._successHandler, this._errorHandler)
  },
  getSessionPhotoUploadUrl(sessionId) {
    return Vue.http
      .get(`${API_ROOT}/session/${sessionId}/photo-url`)
      .then(this._successHandler, this._errorHandler)
  },
  timedOutSession(sessionId, data) {
    return Vue.http
      .post(`${API_ROOT}/session/${sessionId}/timed-out`, data)
      .then(this._successHandler, this._errorHandler)
  },
  resetWhiteboard(data) {
    return Vue.http
      .post(`${WHITEBOARD_ROOT}/reset`, data)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetSessions({
    page,
    showBannedUsers,
    showTestUsers,
    sessionActivityFrom,
    sessionActivityTo,
    minMessagesSent,
    minSessionLength,
    studentRating,
    volunteerRating,
    firstTimeStudent,
    firstTimeVolunteer,
    isReported
  }) {
    const queryParams = new URLSearchParams({
      page,
      showBannedUsers,
      showTestUsers,
      sessionActivityFrom,
      sessionActivityTo,
      minMessagesSent,
      minSessionLength,
      studentRating,
      volunteerRating,
      firstTimeStudent,
      firstTimeVolunteer,
      isReported
    }).toString()

    return Vue.http
      .get(`${API_ROOT}/sessions?${queryParams}`)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetSession(sessionId) {
    return Vue.http
      .get(`${API_ROOT}/session/${sessionId}/admin`)
      .then(this._successHandler, this._errorHandler)
  },
  adminReviewPendingVolunteer({ volunteerId, data }) {
    return Vue.http
      .post(`${API_ROOT}/volunteers/review/${volunteerId}`, data)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetVolunteersToReview(page) {
    return Vue.http
      .get(`${API_ROOT}/volunteers/review?page=${page}`)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetSessionNotifications(sessionId) {
    return Vue.http
      .get(`${API_ROOT}/session/${sessionId}/notifications`)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetSessionsToReview({ page, users }) {
    const queryParams = new URLSearchParams({
      page,
      users
    }).toString()
    return Vue.http
      .get(`${API_ROOT}/session/review?${queryParams}`)
      .then(this._successHandler, this._errorHandler)
  },
  adminUpdateSession(sessionId, data) {
    return Vue.http
      .put(`${API_ROOT}/session/${sessionId}`, data)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetUser(userId, page) {
    return Vue.http
      .get(`${API_ROOT}/user/${userId}?page=${page}`)
      .then(this._successHandler, this._errorHandler)
  },
  adminUpdateUser(userId, data) {
    return Vue.http
      .put(`${API_ROOT}/user/${userId}`, data)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetUsers({
    page,
    userId,
    firstName,
    lastName,
    email,
    partnerOrg,
    highSchool
  }) {
    const queryParams = new URLSearchParams({
      page,
      userId,
      firstName,
      lastName,
      email,
      partnerOrg,
      highSchool
    }).toString()

    return Vue.http
      .get(`${API_ROOT}/users?${queryParams}`)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetIneligibleStudents(page) {
    return Vue.http
      .get(`${ELIGIBILITY_API_ROOT}/ineligible-students?page=${page}`)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetSchool(schoolId) {
    return Vue.http
      .get(`${ELIGIBILITY_API_ROOT}/school/${schoolId}`)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetSchools({ name, state, city, page }) {
    const queryParams = new URLSearchParams({
      name,
      state,
      city,
      page
    }).toString()
    return Vue.http
      .get(`${ELIGIBILITY_API_ROOT}/schools?${queryParams}`)
      .then(this._successHandler, this._errorHandler)
  },
  adminCreateSchool(data) {
    return Vue.http
      .post(`${ELIGIBILITY_API_ROOT}/school/new`, data)
      .then(this._successHandler, this._errorHandler)
  },
  adminUpdateSchool(schoolId, data) {
    return Vue.http
      .put(`${ELIGIBILITY_API_ROOT}/school/${schoolId}`, data)
      .then(this._successHandler, this._errorHandler)
  },
  adminUpdateSchoolApproval(data) {
    return Vue.http
      .post(`${ELIGIBILITY_API_ROOT}/school/approval`, data)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetSessionReport({
    joinedBefore,
    joinedAfter,
    sessionRangeFrom,
    sessionRangeTo,
    highSchoolId,
    studentPartnerOrg,
    studentPartnerSite
  }) {
    const queryParams = new URLSearchParams({
      joinedBefore,
      joinedAfter,
      sessionRangeFrom,
      sessionRangeTo,
      highSchoolId,
      studentPartnerOrg,
      studentPartnerSite
    }).toString()
    return Vue.http
      .get(`${API_ROOT}/reports/session-report?${queryParams}`, {
        timeout: 300000
      })
      .then(this._successHandler, this._errorHandler)
  },
  adminGetUsageReport({
    joinedBefore,
    joinedAfter,
    sessionRangeFrom,
    sessionRangeTo,
    highSchoolId,
    studentPartnerOrg,
    studentPartnerSite
  }) {
    const queryParams = new URLSearchParams({
      joinedBefore,
      joinedAfter,
      sessionRangeFrom,
      sessionRangeTo,
      highSchoolId,
      studentPartnerOrg,
      studentPartnerSite
    }).toString()
    return Vue.http
      .get(`${API_ROOT}/reports/usage-report?${queryParams}`, {
        timeout: 300000
      })
      .then(this._successHandler, this._errorHandler)
  },
  adminGetStudentPartners() {
    return Vue.http
      .get(`${AUTH_ROOT}/partner/student-partners`)
      .then(this._successHandler, this._errorHandler)
  },
  adminGetVolunteerPartners() {
    return Vue.http
      .get(`${AUTH_ROOT}/partner/volunteer-partners`)
      .then(this._successHandler, this._errorHandler)
  },

  adminGetZipCodes(zipCode) {
    return Vue.http
      .get(`${ELIGIBILITY_API_ROOT}/zip-codes/${zipCode}`)
      .then(this._successHandler, this._errorHandler)
  },

  getQuestions(context, data) {
    return context.$http
      .post(`${API_ROOT}/training/questions`, data)
      .then(this._successHandler, this._errorHandler)
  },
  getQuizScore(context, data) {
    return context.$http
      .post(`${API_ROOT}/training/score`, data)
      .then(this._successHandler, this._errorHandler)
  },
  getReviewMaterials(context, data) {
    return context.$http
      .get(`${API_ROOT}/training/review/${data}`)
      .then(this._successHandler, this._errorHandler)
  },
  getTrainingCourse(courseKey) {
    return Vue.http
      .get(`${API_ROOT}/training/course/${courseKey}`)
      .then(this._successHandler, this._errorHandler)
  },
  recordTrainingCourseProgress(courseKey, materialKey) {
    return Vue.http
      .post(`${API_ROOT}/training/course/${courseKey}/progress`, {
        materialKey
      })
      .then(this._successHandler, this._errorHandler)
  },
  updateSchedule(context, data) {
    return context.$http
      .post(`${API_ROOT}/calendar/save`, data)
      .then(this._successHandler, this._errorHandler)
  },
  searchSchool(context, { query }) {
    return context.$http
      .get(
        `${ELIGIBILITY_API_ROOT}/school/search?q=${encodeURIComponent(query)}`
      )
      .then(this._successHandler, this._errorHandler)
  },
  checkStudentEligibility(
    context,
    { schoolUpchieveId, zipCode, email, referredByCode }
  ) {
    return context.$http
      .post(`${ELIGIBILITY_API_ROOT}/check`, {
        schoolUpchieveId,
        zipCode,
        email,
        referredByCode
      })
      .then(this._successHandler, this._errorHandler)
  },
  checkIfMessageIsClean(context, data) {
    return context.$http
      .post(`${API_ROOT}/moderate/message`, data)
      .then(this._successHandler, this._errorHandler)
  },
  feedback(context, data) {
    return context.$http
      .post(`${API_ROOT}/feedback`, data)
      .then(this._successHandler, this._errorHandler)
  },
  getFeedback({ sessionId, userType }) {
    const queryParams = new URLSearchParams({
      sessionId,
      userType
    }).toString()
    return Vue.http
      .get(`${API_ROOT}/feedback?${queryParams}`)
      .then(this._successHandler, this._errorHandler)
  },
  savePushToken(context, data) {
    return context.$http
      .post(`${API_ROOT}/push-token/save`, data)
      .then(this._successHandler, this._errorHandler)
  },
  addReference({ referenceFirstName, referenceLastName, referenceEmail }) {
    return Vue.http
      .post(`${API_ROOT}/user/volunteer-approval/reference`, {
        referenceFirstName,
        referenceLastName,
        referenceEmail
      })
      .then(this._successHandler, this._errorHandler)
  },
  deleteReference({ referenceEmail }) {
    return Vue.http
      .post(`${API_ROOT}/user/volunteer-approval/reference/delete`, {
        referenceEmail
      })
      .then(this._successHandler, this._errorHandler)
  },
  checkReference(referenceId) {
    return Vue.http
      .get(`${REFERENCE_API_ROOT}/${referenceId}`)
      .then(this._successHandler, this._errorHandler)
  },
  saveReferenceForm(referenceId, data) {
    return Vue.http
      .post(`${REFERENCE_API_ROOT}/${referenceId}/submit`, data)
      .then(this._successHandler, this._errorHandler)
  },
  getPhotoUploadUrl() {
    return Vue.http
      .get(`${API_ROOT}/user/volunteer-approval/photo-url`)
      .then(this._successHandler, this._errorHandler)
  },
  addBackgroundInfo(data) {
    return Vue.http
      .post(`${API_ROOT}/user/volunteer-approval/background-information`, data)
      .then(this._successHandler, this._errorHandler)
  },
  submitPresessionSurvey(sessionId, responseData) {
    return Vue.http
      .post(`${API_ROOT}/survey/presession/${sessionId}`, { responseData })
      .then(this._successHandler, this._errorHandler)
  },
  getPresessionSurvey(sessionId) {
    return Vue.http
      .get(`${API_ROOT}/survey/presession/${sessionId}`)
      .then(this._successHandler, this._errorHandler)
  }
}
