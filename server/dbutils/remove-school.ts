import SchoolModel from '../models/School'
import dbconnect from './dbconnect'
import logger from '../logger'
import mongoose from 'mongoose'

const main = async (): Promise<void> => {
  const schoolIdToRemove = ''

  if (!schoolIdToRemove) {
    logger.info('Please enter a school id to remove')
    process.exit(1)
  }

  try {
    await dbconnect()
    const results = await SchoolModel.deleteOne({
      _id: schoolIdToRemove
    })
    logger.info(results)
  } catch (error) {
    logger.error(error)
    process.exit(1)
  } finally {
    mongoose.disconnect()
    process.exit(0)
  }
}

main()