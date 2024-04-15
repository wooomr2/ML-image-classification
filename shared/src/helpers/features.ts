import { Draw } from '../canvas/draw'
import { minBoundingBox } from '../maths/graham-scan'
import { Polygon } from '../maths/polygon'
import { Path } from '../types'

export const getPathCount = (paths: Path[]): number => {
  return paths.length
}

export const getPointCount = (paths: Path[]): number => {
  const points = paths.flat()

  return points.length
}

export const getWidth = (paths: Path[]): number => {
  const points = paths.flat()
  if (points.length === 0) return 0

  const xs = points.map(point => point[0])

  const min = Math.min(...xs)
  const max = Math.max(...xs)

  return max - min
}

export const getHeight = (paths: Path[]): number => {
  const points = paths.flat()
  if (points.length === 0) return 0

  const ys = points.map(point => point[1])

  const min = Math.min(...ys)
  const max = Math.max(...ys)

  return max - min
}

export const getElongation = (paths: Path[]): number => {
  const points = paths.flat()
  const { width, height } = minBoundingBox(points)

  return (Math.max(width, height) + 1) / (Math.min(width, height) + 1)
}

export const getRoundness = (paths: Path[]): number => {
  const points = paths.flat()
  const { hull } = minBoundingBox(points)

  return Polygon.roundness(hull)
}

export const getComplexity = (paths: Path[], ctx: CanvasRenderingContext2D): number => {
  const pixels = Draw.getPixels(ctx, paths, true)

  return pixels.filter(a => a != 0).length
}

export const inUse = [
  // { name: 'Path Count', function: getPathCount },
  // { name: 'Point Count', function: getPointCount },
  { name: 'Width', function: getWidth },
  { name: 'Height', function: getHeight },
  { name: 'Elongation', function: getElongation },
  { name: 'Roundness', function: getRoundness },
  { name: 'Complexity', function: getComplexity },
]

/** pixel intensities (a feature vector with 20*20=400 dimensions) */
export const getPixelIntensities = (paths: Path[], ctx: CanvasRenderingContext2D) => {
  const pixels = Draw.getPixels(ctx, paths, true)

  return pixels
}
