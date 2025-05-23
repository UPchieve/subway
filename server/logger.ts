import * as Sentry from '@sentry/node'
import pino from 'pino'
import config from './config'
import newrelic from 'newrelic'
import { isDevEnvironment, isE2eEnvironment } from './utils/environments'

// TODO: Update pino.
export const pinoLogger =
  !isDevEnvironment() && !isE2eEnvironment()
    ? pino({
        level: config.logLevel,
      })
    : pino({
        level: config.logLevel,
        transport: {
          target: 'pino-pretty',
        },
      })

// TODO: Update args and their types.
const logger = {
  debug(...args: any) {
    // @ts-ignore
    pinoLogger.debug(...args)
  },
  info(...args: any) {
    // @ts-ignore
    pinoLogger.info(...args)
  },
  warn(...args: any) {
    // @ts-ignore
    pinoLogger.warn(...args)
  },
  error(...args: any) {
    // @ts-ignore
    pinoLogger.error(...args)
    Sentry.captureException(args)
  },
}

// TODO: Consolidate into one logger file
// TODO: Remove in favour of `logger.error`.
export function logError(
  error: Error,
  customAttributes?: { [key: string]: string | number | boolean }
): void {
  newrelic.noticeError(error, customAttributes)
}

export default logger
