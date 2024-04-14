import { ISample, ITestingSample } from '../types'

export const formatNumber = (n: number, digit: number = 2): string => {
  return n.toFixed(digit)
}

export const formatPercent = (n: number, digit: number = 2): string => {
  return formatNumber(n * 100, digit) + '%'
}

export const groupBy = <T>(arr: T[], prop: keyof T): Record<string, T[]> => {
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

export const isTestingSample = (sample: ISample | ITestingSample): sample is ITestingSample => {
  if ('truth' in sample && 'correct' in sample) {
    return true
  }
  return false
}

export const toCSV = (headers: string[], rows: any[][]) => {
  let str = headers.join(',') + '\n'
  for (const row of rows) {
    str += row.join(',') + '\n'
  }

  return str
}

export const getRGBA = (value: number) => {
  const R = value < 0 ? 0 : 255
  const G = R
  const B = value > 0 ? 0 : 255
  const A = Math.abs(value)

  return `rgba(${R},${G},${B},${A})`
}

export const getRandomColor = () => {
  const hue = 290 + Math.random() * 260

  return `hsl(${hue},100%, 60%)`
}
