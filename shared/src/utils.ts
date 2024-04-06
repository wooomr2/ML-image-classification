export function formatNumber(n: number, digit: number = 2): number {
  return Number((n * 100).toFixed(digit))
}

export function formatPercent(n: number, digit: number = 2): string {
  return formatNumber(n, digit) + '%'
}

export function groupBy<T>(arr: T[], prop: keyof T): Record<string, T[]> {
  const groups = arr.reduce(
    (acc, obj) => {
      const key = String(obj[prop])
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    },
    {} as Record<string, T[]>
  )

  return groups
}
