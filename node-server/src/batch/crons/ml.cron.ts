import { createCanvas } from 'canvas'
import * as fs from 'fs'
import {
  Draw,
  FILE_PATH,
  Feature,
  IMAGE_LABELS,
  IPreProcessedData,
  IRawData,
  ISample,
  Path,
  Point,
  TLabel,
  normalizePoints,
} from 'shared'
import { printProgress } from '../../utils/process.util'

// 주의:: node-canvas의 CanvasRenderingContext2D를 DOM의 CanvasRenderingContext2D로 type-casting해서 사용중
const canvas = createCanvas(400, 400)
const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D

export default class MLCron {
  static async run() {
    await MLCron.preprocess_rawdata()
    await MLCron.generate_dataset()
    await MLCron.feature_extractor()
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

          // TODO:: data 폴더에 이미지 생성은 없어도 될듯. 추후 삭제
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

    const featureFuncs = Feature.inUse.map(f => f.function)

    const samples = JSON.parse(fs.readFileSync(FILE_PATH.SAMPLES_JSON, { encoding: 'utf-8' })) as ISample[]
    for (const sample of samples) {
      const data = fs.readFileSync(`${FILE_PATH.JSON_DIR}/${sample.id}.json`, { encoding: 'utf-8' })

      const paths = JSON.parse(data) as Path[]

      sample.point = new Point(featureFuncs[0](paths), featureFuncs[1](paths))
    }

    const minMax = normalizePoints(samples.map(s => s.point))

    ctx.getImageData(0, 0, 400, 400)

    const features = JSON.stringify({ featureNames: Feature.inUse.map(f => f.name), samples: samples })

    fs.writeFileSync(FILE_PATH.FEATURES_JSON, features)
    fs.writeFileSync(FILE_PATH.WEB_FEATURES_TS, `export const features=${features};`)
    fs.writeFileSync(FILE_PATH.MIN_MAX_TS, `export const minMax=${JSON.stringify(minMax)};`)

    console.log('STEP3 - Feature Extraction DONE.')
  }
}
