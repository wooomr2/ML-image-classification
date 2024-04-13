// screen coordinates: the x-axis is rightward, the y-axis is downward
import { IBoundingBox, ICoincidentBox, Point } from '../types'
import { add, dot, scale, sqDist, subtract, unit } from './basic'

/** minimum (area) bounding box for a given hull (or set of points) */
const minBoundingBox = (points: Point[], hull?: Point[]): IBoundingBox => {
  let result = { width: 0, height: 0, vertices: points, hull: points }

  if (points.length < 3) {
    return result
  }

  hull = hull || grahamScan(points)

  let minArea = Number.MAX_VALUE
  for (let i = 0; i < hull.length; ++i) {
    const { width, height, vertices } = coincidentBox(hull, i, (i + 1) % hull.length)
    const area = width * height
    if (area < minArea) {
      minArea = area
      result = { width, height, vertices, hull }
    }
  }

  return result
}

/**
 * builds a box with one of the edges being coincident with the edge
 * between hull's points i and j (expected to be neighbors)
 *  */
const coincidentBox = (hull: Point[], i: number, j: number): ICoincidentBox => {
  const origin = hull[i]
  // build base vectors for a new system of coordinates
  // where the x-axis is coincident with the i-j edge
  const baseX = unit(subtract(hull[j], origin))
  // and the y-axis is orthogonal (90 degrees rotation counter-clockwise)
  const baseY = [baseX[1], -baseX[0]]

  let left = 0
  let right = 0
  let top = 0
  let bottom = 0
  // for every point of a hull
  for (const p of hull) {
    // calculate position relative to the origin
    const n = [p[0] - origin[0], p[1] - origin[1]]
    // calculate position in new axis (rotate)
    const v = [dot(baseX, n), dot(baseY, n)]
    // apply trivial logic for calculating the bounding box
    // as rotation is out of consideration at this point
    left = Math.min(v[0], left)
    top = Math.min(v[1], top)
    right = Math.max(v[0], right)
    bottom = Math.max(v[1], bottom)
  }

  // calculate bounding box vertices back in original screen space
  const vertices = [
    add(add(scale(baseX, left), scale(baseY, top)), origin),
    add(add(scale(baseX, left), scale(baseY, bottom)), origin),
    add(add(scale(baseX, right), scale(baseY, bottom)), origin),
    add(add(scale(baseX, right), scale(baseY, top)), origin),
  ]

  return {
    width: right - left,
    height: bottom - top,
    vertices,
  }
}

/** builds a convex hull (a polygon) using the Graham scan algorithm
 * - https://en.wikipedia.org/wiki/Graham_scan
 *  */
const grahamScan = (points: Point[]): Point[] => {
  const lowestPoint = lowestVerticalPoint(points)
  const sortedPoints = sortPoints(lowestPoint, points)

  // initialize the stack with the first three points
  const stack = [sortedPoints[0], sortedPoints[1], sortedPoints[2]]

  // iterate over the remaining points
  for (let i = 3; i < sortedPoints.length; i++) {
    let top = stack.length - 1
    // exclude points from the end
    // until adding a new point won't cause a concave
    // so that the resulting polygon will be convex
    while (top > 0 && getOrientation(stack[top - 1], stack[top], sortedPoints[i]) <= 0) {
      stack.pop()
      top--
    }
    // add the point
    stack.push(sortedPoints[i])
  }

  return stack
}

/** y가 가장 큰 point(같은 경우 x가 작은 값) */
const lowestVerticalPoint = (points: Point[]): Point =>
  points.reduce((lowest, point) => {
    if (point[1] > lowest[1]) {
      return point
    }
    if (point[1] === lowest[1] && point[0] < lowest[0]) {
      return point
    }
    return lowest
  })

/** orders points in a counter-clockwise relative to the given origin */
const sortPoints = (origin: Point, points: Point[]): Point[] =>
  points.slice().sort((a, b) => {
    const orientation = getOrientation(origin, a, b)
    if (orientation === 0) {
      // if two points make the same angle with the lowest point, choose the closer one
      return sqDist(origin, a) - sqDist(origin, b)
    }
    return -orientation
  })

/**
 * p2's relative position to vector(p1->p3)
 * @returns 0(on the line) | 1(right) | -1(left)
 *  */
const getOrientation = (p1: Point, p2: Point, p3: Point) => {
  const val = (p2[1] - p1[1]) * (p3[0] - p2[0]) - (p2[0] - p1[0]) * (p3[1] - p2[1])
  if (val === 0) {
    return 0
  }
  return val > 0 ? 1 : -1
}

export { coincidentBox, getOrientation, grahamScan, lowestVerticalPoint, minBoundingBox, sortPoints }
