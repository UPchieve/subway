import moment from 'moment'

export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export const UTC_TO_HOUR_MAPPING = {
  0: '12a',
  1: '1a',
  2: '2a',
  3: '3a',
  4: '4a',
  5: '5a',
  6: '6a',
  7: '7a',
  8: '8a',
  9: '9a',
  10: '10a',
  11: '11a',
  12: '12p',
  13: '1p',
  14: '2p',
  15: '3p',
  16: '4p',
  17: '5p',
  18: '6p',
  19: '7p',
  20: '8p',
  21: '9p',
  22: '10p',
  23: '11p'
}

export const HOUR_TO_UTC_MAPPING = {
  '12a': 0,
  '1a': 1,
  '2a': 2,
  '3a': 3,
  '4a': 4,
  '5a': 5,
  '6a': 6,
  '7a': 7,
  '8a': 8,
  '9a': 9,
  '10a': 10,
  '11a': 11,
  '12p': 12,
  '1p': 13,
  '2p': 14,
  '3p': 15,
  '4p': 16,
  '5p': 17,
  '6p': 18,
  '7p': 19,
  '8p': 20,
  '9p': 21,
  '10p': 22,
  '11p': 23
}

export const ONE_DAY_ELAPSED_MILLISECONDS = 1000 * 60 * 60 * 24

export enum DATE_RANGE_COMPARISON_FIELDS {
  CREATED_AT = '$createdAt',
  SENT_AT = '$sentAt',
  PAST_SESSION_CREATED_AT = '$pastSession.createdAt'
}

export const BLACKOUT_PERIOD_START = moment()
  .utc()
  .month('June')
  .startOf('month')
  .toDate()

export const BLACKOUT_PERIOD_END = moment()
  .utc()
  .month('September')
  .date(1)
  .endOf('day')
  .toDate()