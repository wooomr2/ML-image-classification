import { Path } from './types'

export const getPathCount = (paths: Path[]): number => {
  return paths.length
}

export const getPointCount = (paths: Path[]): number => {
  const points = paths.flat()

  return points.length
}
