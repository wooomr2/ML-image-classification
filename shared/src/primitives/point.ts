export class Point {
  constructor(
    public x: number,
    public y: number
  ) {}

  /** @return [x, y] */
  get coordinate(): [number, number] {
    return [this.x, this.y]
  }

  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y
  }
}
