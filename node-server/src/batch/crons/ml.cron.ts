import { createCanvas } from 'canvas'
import * as fs from 'fs'
import { Draw, FILE_PATH, IMAGE_LABELS, IPreProcessedData, IRawData, Path, Point, TLabel } from 'shared'
import { printProgress } from '../../utils/process.util'

// 주의:: node-canvas의 CanvasRenderingContext2D를 DOM의 CanvasRenderingContext2D로 type-casting해서 사용중
const canvas = createCanvas(400, 400)
const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D

export default class MLCron {
  static async run() {
    await MLCron.preprocessing_rawdata()
    await MLCron.generate_dataset()
  }

  static async preprocessing_rawdata() {
    console.log('STEP1 - PRE-PROCESSING RAW DATA...')

    const fileNames = fs.readdirSync(FILE_PATH.RAW_DIR)
    for (const fileName of fileNames) {
      const content = fs.readFileSync(FILE_PATH.RAW_DIR + '/' + fileName, { encoding: 'utf-8' })

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

    interface ISample {
      id: number
      label: string
      student_id: number
      student_name: string
      paths: Path[]
    }

    const samples: ISample[] = []

    let id = 1
    const fileNames = fs.readdirSync(FILE_PATH.PRE_PROCESSED_DIR)

    for (const fileName of fileNames) {
      const content = fs.readFileSync(FILE_PATH.PRE_PROCESSED_DIR + '/' + fileName, { encoding: 'utf-8' })

      const { session, student, drawings } = JSON.parse(content) as IPreProcessedData

      for (const [label, paths] of Object.entries(drawings)) {
        samples.push({
          id: id,
          label: label,
          student_id: session,
          student_name: student,
          paths: paths,
        })

        fs.writeFileSync(`${FILE_PATH.JSON_DIR}/${id}.json`, JSON.stringify(paths))

        MLCron.#generateImageFile(`${FILE_PATH.IMG_DIR}/${id}.png`, paths)

        printProgress(id, fileNames.length * IMAGE_LABELS.length)

        id++
      }
    }

    fs.writeFileSync(FILE_PATH.SAMPLES, JSON.stringify(samples))

    console.log('STEP2 - DATASET IS GENERATED.')
  }

  static #generateImageFile(outFilePath: string, paths: Path[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    Draw.paths(ctx, paths)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(outFilePath, buffer)
  }
}
