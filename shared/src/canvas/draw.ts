import { Path } from '../types'

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
}
