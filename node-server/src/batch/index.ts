import schedule from 'node-schedule'
import MLCron from './crons/ml.cron'

const registerBatch = () => {
  // schedule.scheduleJob('0 0/5 * * * *', MLCron.run)
}

export = registerBatch
