import { invLerp } from '../maths/basic'
import { IBoundary, Path } from '../types'

export class Draw {
  static path(ctx: CanvasRenderingContext2D, path: Path, color = 'black', width = 3) {
    if (path.length === 0) return

    ctx.strokeStyle = color
    ctx.lineWidth = width

    ctx.beginPath()

    const startPoint = path[0]
    ctx.moveTo(startPoint[0], startPoint[1])

    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i][0], path[i][1])
    }

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.stroke()
  }

  static paths(ctx: CanvasRenderingContext2D, paths: Path[], color = 'black') {
    for (const path of paths) {
      Draw.path(ctx, path, color)
    }
  }

  /** Draw paths and return pixel's alpha
   *  @returns pixel's alpha */
  static getPixels = (ctx: CanvasRenderingContext2D, paths: Path[], rescaling = true, size = 400) => {
    if (rescaling) {
      const points = paths.flat()

      const xs = points.map(point => point[0])
      const ys = points.map(point => point[1])

      const bounds: IBoundary = {
        left: Math.min(...xs),
        right: Math.max(...xs),
        top: Math.min(...ys),
        bottom: Math.max(...ys),
      }

      const newPaths = []
      for (const path of paths) {
        const newPath = path.map(p => [
          invLerp(bounds.left, bounds.right, p[0]) * size,
          invLerp(bounds.top, bounds.bottom, p[1]) * size,
        ])
        newPaths.push(newPath)
      }

      Draw.paths(ctx, newPaths)
    } else {
      Draw.paths(ctx, paths)
    }

    const imgData = ctx.getImageData(0, 0, size, size)

    // [R,G,B,A, R,G,B,A ...] => [A,A, ...]
    return imgData.data.filter((_, idx) => idx % 4 == 3)
  }

  static text(ctx: CanvasRenderingContext2D, text: string, color = 'black', loc = [0, 0], size = 100) {
    ctx.font = `bold ${size}px`
    ctx.textBaseline = 'top'
    ctx.fillStyle = color
    ctx.fillText(text, loc[0], loc[1])
  }
}
