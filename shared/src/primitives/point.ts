export class Point {
  constructor(
    public x: number,
    public y: number
  ) {}

  static dimension(): number {
    return 2
  }

  get coordinate() {
    return {
      x: this.x,
      y: this.y,
    }
  }

  /** @return [x, y] */
  get coordArray(): [number, number] {
    return [this.x, this.y]
  }

  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y
  }
}
