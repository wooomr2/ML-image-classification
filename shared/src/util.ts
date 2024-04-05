export class Util {
  static formatNumber(n: number, digit: number = 2): number {
    return Number((n * 100).toFixed(digit))
  }

  static formatPercent(n: number, digit: number = 2): string {
    return Util.formatNumber(n, digit) + '%'
  }
}
