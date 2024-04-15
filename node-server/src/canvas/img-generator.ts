import { Canvas, createCanvas } from 'canvas'
import { Draw, IClassifier, IMAGE_STYLES, Path, Polygon, TLabel, minBoundingBox } from 'shared'
import { ML_CONSTANTS } from '../constants'
import { printProgress } from '../utils/process.util'

export default class ImgGenerator {
  canvas: Canvas
  ctx: CanvasRenderingContext2D
  size: number
  constructor(size = ML_CONSTANTS.DEFAULT_CANVAS_SIZE) {
    this.canvas = createCanvas(size, size)
    this.ctx = this.canvas.getContext('2d') as unknown as CanvasRenderingContext2D
    this.size = size
  }

  setCanvasSize(size: number) {
    this.size = size
    this.canvas.width = size
    this.canvas.height = size
    this.ctx.clearRect(0, 0, size, size)
  }

  generateImageBuffer(paths: Path[]): Buffer {
    this.setCanvasSize(ML_CONSTANTS.DEFAULT_CANVAS_SIZE)

    const { canvas, ctx } = this

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

    return buffer
  }

  generateImageBufferUsingPixels(paths: Path[]): Buffer {
    this.setCanvasSize(ML_CONSTANTS.DEFAULT_CANVAS_SIZE)
    const { canvas, ctx } = this

    const pixels = Draw.getPixels(ctx, paths)
    const size = Math.sqrt(pixels.length)

    const imgData = ctx.getImageData(0, 0, size, size)

    for (let i = 0; i < pixels.length; i++) {
      const alpha = pixels[i]
      const startIdx = i * 4

      imgData.data[startIdx] = 0
      imgData.data[startIdx + 1] = 0
      imgData.data[startIdx + 2] = 0
      imgData.data[startIdx + 3] = alpha
    }
    ctx.putImageData(imgData, 0, 0)

    const buffer = canvas.toBuffer('image/png')

    return buffer
  }

  generateDecisionBoundary(classifier: IClassifier, dimension = 2): Buffer {
    console.log('Generating Decision Boundary ...')
    this.setCanvasSize(ML_CONSTANTS.DECISION_BOUNDARY_SIZE)

    const { canvas, ctx } = this

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const point = [x / canvas.width, 1 - y / canvas.height]

        // n-dimensional point의 추가 차원축을 [0,1] 사이의 특정값으로 slice 한 뒤, 2D-decision-boundary-image 생성
        while (point.length < dimension) {
          point.push(0)
        }
        const { label } = classifier.predict(point)

        ctx.fillStyle = IMAGE_STYLES[label as TLabel].color
        ctx.fillRect(x, y, 1, 1)
      }

      printProgress(x + 1, canvas.width)
    }

    const buffer = canvas.toBuffer('image/png')

    return buffer
  }
}
