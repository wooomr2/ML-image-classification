import { readFileSync } from 'fs'
import { Point } from 'shared'

const dataDir = '../../../data'
const constants = {
  DATA_DIR: dataDir,
  RAW_DIR: dataDir + '/raw',
  DATASET_DIR: dataDir + '/dataset',
  JSON_DIR: dataDir + '/dataset/json',
  IMG_DIR: dataDir + '/dataset/img',
  SAMPLES: dataDir + '/dataset/samples.json',
}

export default class MLCron {
  static async run() {
    console.log('RUN MLCron')
    await MLCron._generate_dataset()
  }

  static async _generate_dataset() {
    console.log('GENERATING DATASET ...')

    const fileNames = readFileSync(constants.RAW_DIR, { encoding: 'utf-8' })
    const samples = []
    let id = 1

    for (const fileName of fileNames) {
      const content = readFileSync(constants.RAW_DIR + '/' + fileName, { encoding: 'utf-8' })

      interface IContent {
        session: number
        student: string
        drawings: Record<string, Point[][]>
      }

      const { session, student, drawings } = JSON.parse(content)
    }
  }
}
