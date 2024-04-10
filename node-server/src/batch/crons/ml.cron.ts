import { createCanvas } from 'canvas'
import * as fs from 'fs'
import {
  Draw,
  FILE_PATH,
  Feature,
  IFeatures,
  IMAGE_LABELS,
  IMAGE_STYLES,
  IPreProcessedData,
  IRawData,
  ISample,
  KNN,
  Path,
  Point,
  TLabel,
  Util,
  normalizePoints,
} from 'shared'
import { printProgress } from '../../utils/process.util'
import { ML_CONSTANTS } from '../../const'

// 주의:: node-canvas의 CanvasRenderingContext2D를 DOM의 CanvasRenderingContext2D로 type-casting해서 사용중
const canvas = createCanvas(ML_CONSTANTS.DEFAULT_CANVAS_SIZE, ML_CONSTANTS.DEFAULT_CANVAS_SIZE)
const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D

export default class MLCron {
  static async run() {
    await MLCron.preprocess_rawdata()
    await MLCron.generate_dataset()
    await MLCron.feature_extractor()
    await MLCron.evaluate_knn()
  }

  static async preprocess_rawdata() {
    console.log('STEP1 - PRE-PROCESSING RAW DATA...')

    const fileNames = fs.readdirSync(FILE_PATH.RAW_DIR)
    for (const fileName of fileNames) {
      const content = fs.readFileSync(`${FILE_PATH.RAW_DIR}/${fileName}`, { encoding: 'utf-8' })

      const { session, student, drawings } = JSON.parse(content) as IRawData

      const newDrawings: Record<TLabel, Path[]> = {
        car: [],
        fish: [],
        house: [],
        tree: [],
        bicycle: [],
        guitar: [],
        pencil: [],
        clock: [],
      }
      for (const [label, paths] of Object.entries(drawings)) {
        newDrawings[label] = paths.map(path => path.map(point => new Point(...point)))
      }

      const preProcessed: IPreProcessedData = {
        session: session,
        student: student,
        drawings: newDrawings,
      }

      fs.writeFileSync(`${FILE_PATH.PRE_PROCESSED_DIR}/${fileName}`, JSON.stringify(preProcessed))
    }

    console.log('STEP1 - PRE-PROCESSING DONE')
  }

  static async generate_dataset() {
    console.log('STEP2 - GENERATING DATASET ...')

    const samples: Omit<ISample, 'point'>[] = []
    {
      let id = 1
      const fileNames = fs.readdirSync(FILE_PATH.PRE_PROCESSED_DIR)

      for (const fileName of fileNames) {
        const content = fs.readFileSync(`${FILE_PATH.PRE_PROCESSED_DIR}/${fileName}`, { encoding: 'utf-8' })

        const { session, student, drawings } = JSON.parse(content) as IPreProcessedData

        for (const [label, paths] of Object.entries(drawings)) {
          samples.push({
            id: id,
            label: label,
            student_id: session,
            student_name: student,
          })

          fs.writeFileSync(`${FILE_PATH.JSON_DIR}/${id}.json`, JSON.stringify(paths))

          MLCron.#generateImageFile(`${FILE_PATH.IMG_DIR}/${id}.png`, paths)
          MLCron.#generateImageFile(`${FILE_PATH.WEB_IMG_DIR}/${id}.png`, paths)

          printProgress(id, fileNames.length * IMAGE_LABELS.length)

          id++
        }
      }
    }

    fs.writeFileSync(FILE_PATH.SAMPLES_JSON, JSON.stringify(samples))
    // fs.writeFileSync(FILE_PATH.WEB_SAMPLES_TS, `export const samples=${JSON.stringify(samples)};`)

    console.log('STEP2 - DATASET IS GENERATED.')
  }

  static #generateImageFile(outFilePath: string, paths: Path[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    Draw.paths(ctx, paths)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(outFilePath, buffer)
  }

  static async feature_extractor() {
    console.log('STEP3 - Feature Extracting ...')

    const samples = JSON.parse(fs.readFileSync(FILE_PATH.SAMPLES_JSON, { encoding: 'utf-8' })) as ISample[]
    for (const sample of samples) {
      const data = fs.readFileSync(`${FILE_PATH.JSON_DIR}/${sample.id}.json`, { encoding: 'utf-8' })

      const paths = JSON.parse(data) as Path[]

      const results = Feature.inUse.map(f => f.function(paths))
      sample.point = new Point(results[0], results[1])
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

    const featureNames = Feature.inUse.map(f => f.name)

    const features = JSON.stringify({ featureNames: featureNames, samples: samples })
    const training = JSON.stringify({ featureNames: featureNames, samples: trainingSamples })
    const testing = JSON.stringify({ featureNames: featureNames, samples: testingSamples })

    fs.writeFileSync(FILE_PATH.FEATURES_JSON, features)
    fs.writeFileSync(FILE_PATH.TRAINING_JSON, training)
    fs.writeFileSync(FILE_PATH.TESTING_JSON, testing)

    fs.writeFileSync(FILE_PATH.FEATURES_TS, `export const features=${features};`)
    fs.writeFileSync(FILE_PATH.TRAINING_TS, `export const training=${training};`)
    fs.writeFileSync(FILE_PATH.TESTING_TS, `export const testing=${testing};`)

    fs.writeFileSync(FILE_PATH.MIN_MAX_TS, `export const minMax=${JSON.stringify(minMax)};`)

    console.log('STEP3 - Feature Extraction DONE.')
  }

  static async evaluate_knn() {
    console.log('STEP4 - KNN Evaluation ...')

    const { samples: trainingSamples } = JSON.parse(
      fs.readFileSync(FILE_PATH.TRAINING_JSON, { encoding: 'utf-8' })
    ) as IFeatures

    const kNN = new KNN(trainingSamples, ML_CONSTANTS.K)

    const { samples: testingSamples } = JSON.parse(
      fs.readFileSync(FILE_PATH.TESTING_JSON, { encoding: 'utf-8' })
    ) as IFeatures

    let totalCount = 0
    let correctCount = 0
    for (const sample of testingSamples) {
      const { label } = kNN.predict(sample.point)
      const isCorrect = sample.label == label

      correctCount += isCorrect ? 1 : 0
      totalCount++
    }

    MLCron.#generateDecisionBoundary(kNN)

    console.log(
      `STEP4 - Done. ACCURACY: ${correctCount}/${totalCount}(${Util.formatPercent(correctCount / totalCount)})`
    )
  }

  static #generateDecisionBoundary(classifier: KNN) {
    console.log('Generating Decision Boundary ...')
    canvas.width = ML_CONSTANTS.DECISION_BOUNDARY_SIZE
    canvas.height = ML_CONSTANTS.DECISION_BOUNDARY_SIZE
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const point = new Point(x / canvas.width, 1 - y / canvas.height)
        const { label } = classifier.predict(point)

        ctx.fillStyle = IMAGE_STYLES[label].color
        ctx.fillRect(x, y, 1, 1)
      }

      printProgress(x + 1, canvas.width);
    }

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(FILE_PATH.DECISION_BOUNDARY_IMG, buffer)
    fs.writeFileSync(FILE_PATH.WEB_DECISION_BOUNDARY_IMG, buffer)
  }
}
