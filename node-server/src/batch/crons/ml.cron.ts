import { createCanvas } from 'canvas'
import * as fs from 'fs'
import {
  Draw,
  Feature,
  IFeatures,
  IMAGE_LABELS,
  IMAGE_STYLES,
  IRawData,
  ISample,
  KNN,
  Path,
  Polygon,
  Util,
  flaggedSampleIds,
  flaggedUserIds,
  minBoundingBox,
  normalizePoints,
} from 'shared'
import { ML_CONSTANTS } from '../../constants'
import { FILE_PATH } from '../../constants/file-path'
import { printProgress } from '../../utils/process.util'

// 주의:: node-canvas의 CanvasRenderingContext2D를 DOM의 CanvasRenderingContext2D로 type-casting해서 사용중
const canvas = createCanvas(ML_CONSTANTS.DEFAULT_CANVAS_SIZE, ML_CONSTANTS.DEFAULT_CANVAS_SIZE)
const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D

export default class MLCron {
  static async run() {
    await MLCron.generate_dataset()
    await MLCron.feature_extractor()
    await MLCron.evaluate_knn()
  }

  static async generate_dataset() {
    console.log('STEP1 - GENERATING DATASET ...')

    {
      if (fs.existsSync(FILE_PATH.DATASET_DIR)) {
        fs.rmSync(FILE_PATH.DATASET_DIR, { recursive: true })
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

          // MLCron.#generateImageFile(`${FILE_PATH.IMG_DIR}/${id}.png`, paths)
          MLCron.#generateImageFile(`${FILE_PATH.WEB_IMG_DIR}/${id}.png`, paths)

          printProgress(id, fileNames.length * IMAGE_LABELS.length)
        }
      }
    }

    fs.writeFileSync(FILE_PATH.SAMPLES_JSON, JSON.stringify(samples))
    // fs.writeFileSync(FILE_PATH.WEB_SAMPLES_TS, `export const samples=${JSON.stringify(samples)};`)

    console.log('STEP1 - DATASET IS GENERATED.')
  }

  static #generateImageFile(outFilePath: string, paths: Path[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    Draw.paths(ctx, paths)

    const { vertices, hull } = minBoundingBox(paths.flat())
    const roundness = Polygon.roundness(hull)

    const R = Math.floor(roundness ** 5 * 255)
    const G = 0
    const B = Math.floor((1 - roundness ** 5) * 255)
    const color = `rgb(${R},${G},${B})`

    // Draw.path(ctx, [...vertices, vertices[0]], 'red')
    Draw.path(ctx, [...hull, hull[0]], color, 10)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(outFilePath, buffer)
  }

  static async feature_extractor() {
    console.log('STEP2 - Feature Extracting ...')

    const samples = JSON.parse(fs.readFileSync(FILE_PATH.SAMPLES_JSON, { encoding: 'utf-8' })) as ISample[]
    for (const sample of samples) {
      const data = fs.readFileSync(`${FILE_PATH.JSON_DIR}/${sample.id}.json`, { encoding: 'utf-8' })

      const paths = JSON.parse(data) as Path[]

      sample.point = Feature.inUse.map(f => f.function(paths))
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

    MLCron.#generateDecisionBoundary(kNN, trainingSamples[0].point.length)

    console.log(
      `STEP3 - Done. ACCURACY: ${correctCount}/${totalCount}(${Util.formatPercent(correctCount / totalCount)})`
    )
  }

  static #generateDecisionBoundary(classifier: KNN, dimension = 2) {
    console.log('Generating Decision Boundary ...')
    canvas.width = ML_CONSTANTS.DECISION_BOUNDARY_SIZE
    canvas.height = ML_CONSTANTS.DECISION_BOUNDARY_SIZE
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const point = [x / canvas.width, 1 - y / canvas.height]

        // n-dimensional point의 추가 차원축을 [0,1] 사이의 특정값으로 slice 한 뒤, 2D-decision-boundary-image 생성
        while (point.length < dimension) {
          point.push(0)
        }
        const { label } = classifier.predict(point)

        ctx.fillStyle = IMAGE_STYLES[label].color
        ctx.fillRect(x, y, 1, 1)
      }

      printProgress(x + 1, canvas.width)
    }

    const buffer = canvas.toBuffer('image/png')
    // fs.writeFileSync(FILE_PATH.DECISION_BOUNDARY_IMG, buffer)
    fs.writeFileSync(FILE_PATH.WEB_DECISION_BOUNDARY_IMG, buffer)
  }
}
