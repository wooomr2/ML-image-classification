import { Point } from '../types'
import { distance, triangleArea } from './basic'

export class Polygon {
  static roundness(polygon: Point[]): number {
    const length = Polygon.len(polygon)
    const area = Polygon.area(polygon)

    const R = length / (2 * Math.PI)
    const circleArea = Math.PI * R ** 2

    const roundness = area / circleArea

    if (isNaN(roundness)) {
      return 0
    }
    return roundness
  }

  static len(polygon: Point[]) {
    let length = 0
    for (let i = 0; i < polygon.length; i++) {
      const nextI = (i + 1) % polygon.length
      length += distance(polygon[i], polygon[nextI])
    }

    return length
  }

  static area(polygon: Point[]): number {
    let area = 0

    const A = polygon[0]
    for (let i = 1; i < polygon.length - 1; i++) {
      const B = polygon[i]
      const C = polygon[i + 1]
      area += triangleArea(A, B, C)
    }

    return area
  }
}
