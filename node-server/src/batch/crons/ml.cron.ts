import * as fs from 'fs'
import {
  Feature,
  IFeatures,
  IMAGE_LABELS,
  IRawData,
  ISample,
  KNN,
  MLP,
  Path,
  Util,
  flaggedSampleIds,
  flaggedUserIds,
  normalizePoints,
} from 'shared'
import ImgGenerator from '../../canvas/img-generator'
import { ML_CONSTANTS } from '../../constants'
import { FILE_PATH } from '../../constants/file-path'
import { printProgress } from '../../utils/process.util'

const imgGenerator = new ImgGenerator()

export default class MLCron {
  static async run() {
    await MLCron.generate_dataset()
    await MLCron.feature_extractor()
    // await MLCron.evaluate_knn()
    await MLCron.evaluate_mlp()
  }

  static async generate_dataset() {
    console.log('STEP1 - GENERATING DATASET ...')

    {
      if (fs.existsSync(FILE_PATH.DATASET_DIR)) {
        fs.rmSync(FILE_PATH.DATASET_DIR, { recursive: true })
      }
      if (fs.existsSync(FILE_PATH.MODEL_DIR)) {
        fs.rmSync(FILE_PATH.MODEL_DIR, { recursive: true })
      }

      fs.mkdirSync(FILE_PATH.DATASET_DIR)
      // fs.mkdirSync(FILE_PATH.IMG_DIR)
      fs.mkdirSync(FILE_PATH.JSON_DIR)
      fs.mkdirSync(FILE_PATH.MODEL_DIR)
    }

    const samples: Omit<ISample, 'point'>[] = []
    {
      let id = 0
      const fileNames = fs.readdirSync(FILE_PATH.RAW_DIR)

      for (const fileName of fileNames) {
        const content = fs.readFileSync(`${FILE_PATH.RAW_DIR}/${fileName}`, { encoding: 'utf-8' })

        const { session, student, drawings } = JSON.parse(content) as IRawData

        if (flaggedUserIds.includes(session)) {
          console.info(`DATA CLEANING:: user session: ${session}`)
          continue
        }

        for (const [label, paths] of Object.entries(drawings)) {
          id++

          if (flaggedSampleIds.includes(id)) {
            console.info(` DATA CLEANING:: skip SampleId: ${id}`)
            continue
          }

          samples.push({
            id: id,
            label: label,
            student_id: session,
            student_name: student,
          })

          fs.writeFileSync(`${FILE_PATH.JSON_DIR}/${id}.json`, JSON.stringify(paths))

          const buffer = imgGenerator.generateImageBufferUsingPixels(paths)

          fs.writeFileSync(`${FILE_PATH.WEB_IMG_DIR}/${id}.png`, buffer)

          printProgress(id, fileNames.length * IMAGE_LABELS.length)
        }
      }
    }

    fs.writeFileSync(FILE_PATH.SAMPLES_JSON, JSON.stringify(samples))
    // fs.writeFileSync(FILE_PATH.WEB_SAMPLES_TS, `export const samples=${JSON.stringify(samples)};`)

    console.log('STEP1 - DATASET IS GENERATED.')
  }

  static async feature_extractor() {
    console.log('STEP2 - Feature Extracting ...')

    const samples = JSON.parse(fs.readFileSync(FILE_PATH.SAMPLES_JSON, { encoding: 'utf-8' })) as ISample[]
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i]
      const data = fs.readFileSync(`${FILE_PATH.JSON_DIR}/${sample.id}.json`, { encoding: 'utf-8' })

      const paths = JSON.parse(data) as Path[]

      imgGenerator.setCanvasSize(20)

      // sample.point = Feature.inUse.map(f => f.function(paths))
      // sample.point = Feature.inUse.map(f => f.function(paths, imgGenerator.ctx))
      sample.point = Object.values(Feature.getPixelIntensities(paths, imgGenerator.ctx))

      printProgress(i, samples.length - 1)
    }

    const trainingSamples: ISample[] = []
    const testingSamples: ISample[] = []
    {
      const trainingAmount = samples.length * ML_CONSTANTS.TRAINIG_RATIO

      for (let i = 0; i < samples.length; i++) {
        if (i < trainingAmount) {
          trainingSamples.push(samples[i])
        } else {
          testingSamples.push(samples[i])
        }
      }
    }

    // trainig-set의 minMax를 기준으로 testing-set을 normalize 한다.
    const minMax = normalizePoints(trainingSamples.map(s => s.point))
    normalizePoints(
      testingSamples.map(s => s.point),
      minMax
    )

    // const featureNames = Feature.inUse.map(f => f.name)
    const featureNames = Array(samples[0].point.length).fill(' ')

    // const features = JSON.stringify({ featureNames: featureNames, samples: samples })
    const training = JSON.stringify({ featureNames: featureNames, samples: trainingSamples })
    const testing = JSON.stringify({ featureNames: featureNames, samples: testingSamples })

    // fs.writeFileSync(FILE_PATH.FEATURES_JSON, features)
    fs.writeFileSync(FILE_PATH.TRAINING_JSON, training)
    fs.writeFileSync(FILE_PATH.TESTING_JSON, testing)

    fs.writeFileSync(
      FILE_PATH.TRAINING_CSV,
      Util.toCSV(
        [...featureNames, 'Label'],
        trainingSamples.map(s => [...s.point, s.label])
      )
    )
    fs.writeFileSync(
      FILE_PATH.TESTING_CSV,
      Util.toCSV(
        [...featureNames, 'Label'],
        testingSamples.map(s => [...s.point, s.label])
      )
    )

    // fs.writeFileSync(FILE_PATH.FEATURES_TS, `export const features=${features};`)
    fs.writeFileSync(FILE_PATH.TRAINING_TS, `export const training=${training};`)
    fs.writeFileSync(FILE_PATH.TESTING_TS, `export const testing=${testing};`)

    fs.writeFileSync(FILE_PATH.MIN_MAX_TS, `export const minMax=${JSON.stringify(minMax)};`)

    console.log('STEP2 - Feature Extraction DONE.')
  }

  static async evaluate_knn() {
    console.log('STEP3 - KNN Evaluation ...')

    const { samples: trainingSamples } = JSON.parse(
      fs.readFileSync(FILE_PATH.TRAINING_JSON, { encoding: 'utf-8' })
    ) as IFeatures

    const knn = new KNN(trainingSamples, ML_CONSTANTS.K)

    const { samples: testingSamples } = JSON.parse(
      fs.readFileSync(FILE_PATH.TESTING_JSON, { encoding: 'utf-8' })
    ) as IFeatures

    let totalCount = 0
    let correctCount = 0
    for (const sample of testingSamples) {
      const { label } = knn.predict(sample.point)
      const isCorrect = sample.label == label

      correctCount += isCorrect ? 1 : 0
      totalCount++
    }

    const buffer = imgGenerator.generateDecisionBoundary(knn, trainingSamples[0].point.length)

    fs.writeFileSync(FILE_PATH.WEB_DECISION_BOUNDARY_IMG, buffer)

    console.log(
      `STEP3 - Done. KNN ACCURACY: ${correctCount}/${totalCount}(${Util.formatPercent(correctCount / totalCount)})`
    )
  }

  static async evaluate_mlp() {
    console.log('STEP3 - MLP Evaluation ...')

    const { samples: trainingSamples } = JSON.parse(
      fs.readFileSync(FILE_PATH.TRAINING_JSON, { encoding: 'utf-8' })
    ) as IFeatures

    const mlp = new MLP([trainingSamples[0].point.length, 10, IMAGE_LABELS.length], [...IMAGE_LABELS])

    if (fs.existsSync(FILE_PATH.MODEL_JSON)) {
      const loaded = JSON.parse(fs.readFileSync(FILE_PATH.MODEL_JSON, { encoding: 'utf-8' }))
      mlp.load(loaded as MLP)
    }

    mlp.fit(trainingSamples, ML_CONSTANTS.MLP_TRY_CNT)

    const { samples: testingSamples } = JSON.parse(
      fs.readFileSync(FILE_PATH.TESTING_JSON, { encoding: 'utf-8' })
    ) as IFeatures

    let totalCount = 0
    let correctCount = 0
    for (const sample of testingSamples) {
      const { label } = mlp.predict(sample.point)
      const isCorrect = sample.label == label

      correctCount += isCorrect ? 1 : 0
      totalCount++
    }

    fs.writeFileSync(FILE_PATH.MODEL_JSON, JSON.stringify(mlp))
    fs.writeFileSync(FILE_PATH.MODEL_TS, `export const model=${JSON.stringify(mlp)}`)

    const buffer = imgGenerator.generateDecisionBoundary(mlp, trainingSamples[0].point.length)

    fs.writeFileSync(FILE_PATH.WEB_DECISION_BOUNDARY_IMG, buffer)

    console.log(
      `STEP3 - Done. MLP ACCURACY: ${correctCount}/${totalCount}(${Util.formatPercent(correctCount / totalCount)})`
    )
  }
}
