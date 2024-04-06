import { Path } from './types'

export function getPathCount(paths: Path[]) {
  return paths.length
}

export function getPointCount(paths: Path[]) {
  const points = paths.flat()
  
  return points.length
}
