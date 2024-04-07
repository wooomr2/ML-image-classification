import { Point } from '../primitives/point'
import { IBoundary } from '../types'

export const add = (p1: Point, p2: Point): Point => {
  return new Point(p1.x + p2.x, p1.y + p2.y)
}

export const subtract = (p1: Point, p2: Point): Point => {
  return new Point(p1.x - p2.x, p1.y - p2.y)
}

export const scale = (p: Point, scaler: number): Point => {
  return new Point(p.x * scaler, p.y * scaler)
}

// v = a + (b - a) * t
export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t
}

//  t = (v - a) / (b - a)
export const invLerp = (a: number, b: number, v: number): number => {
  return (v - a) / (b - a)
}

/** 0: old, 1: new */
export const remap = (a0: number, b0: number, a1: number, b1: number, v: number): number => {
  return lerp(a1, b1, invLerp(a0, b0, v))
}

export const remapPoint = (oldBounds: IBoundary, newBounds: IBoundary, point: Point): Point => {
  return new Point(
    remap(oldBounds.left, oldBounds.right, newBounds.left, newBounds.right, point.x),
    remap(oldBounds.top, oldBounds.bottom, newBounds.top, newBounds.bottom, point.y)
  )
}

export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

export const getNearestIndex = (loc: Point, points: Point[]): number => {
  let minDist = Number.MAX_SAFE_INTEGER
  let nearestIndex = 0

  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const dist = distance(loc, point)
    if (dist < minDist) {
      minDist = dist
      nearestIndex = i
    }
  }

  return nearestIndex
}
