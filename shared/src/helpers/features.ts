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

  const xs = points.map(point => point[0])

  const min = Math.min(...xs)
  const max = Math.max(...xs)

  return max - min
}

export const getHeight = (paths: Path[]): number => {
  const points = paths.flat()

  const ys = points.map(point => point[1])

  const min = Math.min(...ys)
  const max = Math.max(...ys)

  return max - min
}

export const inUse = [
  // { name: 'Path Count', function: getPathCount },
  //{ name: 'Point Count', function: getPointCount },
  { name: 'Width', function: getWidth },
  { name: 'Height', function: getHeight },
]
