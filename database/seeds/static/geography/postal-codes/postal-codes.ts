import fs from 'fs'
import parse from 'csv-parse/lib/sync'
import * as pgQueries from '../pg.queries'
import { wrapInsert } from '../../../utils'

interface csvPostalCodeRecord {
  zipcode: string
  income: number
  state: string
  longitude: number
  latitude: number
}

export async function postalCodes(numZipCodes: number | undefined) {
  const zipFile = fs.readFileSync(`${__dirname}/aggregated_data.csv`)
  const zipRecords: csvPostalCodeRecord[] = await parse(zipFile, {
    delimiter: ',',
    columns: true,
  })
  const recordInsertions = zipRecords.slice(0, numZipCodes).map((record: csvPostalCodeRecord) => {
    const typedRecord = record as csvPostalCodeRecord
    const excludedTerritories = [
      'VI',
      'GU',
      'AE',
      'AA',
      'AP',
      'AS',
      'PR',
      'PW',
      'FM',
      'MP',
      'MH',
    ]
    if (excludedTerritories.includes(record.state)) return Promise.resolve()
    return wrapInsert('postal_codes', pgQueries.insertZipCode.run, {
      code: typedRecord.zipcode,
      usStateCode: typedRecord.state,
      income: typedRecord.income,
      lattitude: typedRecord.latitude,
      longitude: typedRecord.longitude,
    })
  })
  await Promise.all(recordInsertions)
  await wrapInsert('postal_codes', pgQueries.insertZipCode.run, {
    code: '00000',
    usStateCode: 'NA',
    income: 0,
    lattitude: 0,
    longitude: 0
  })
}
