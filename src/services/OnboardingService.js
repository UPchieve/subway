import NetworkService from './NetworkService'

export default {
  sendVerification(context) {
    return NetworkService.sendVerification(context)
      .then(() => {
        context.msg = 'Email sent!'
      })
      .catch(err => {
        context.msg = 'Error occurred'
        throw err
      })
  },
  confirmVerification(context, token) {
    return NetworkService.confirmVerification(context, { token }).catch(err => {
      context.msg = 'Error occurred'
      throw err
    })
  }
}
