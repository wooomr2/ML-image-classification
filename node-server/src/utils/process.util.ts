import { Util } from 'shared'

export const printProgress = (count: number, max: number) => {
  process.stdout.clearLine(0)
  process.stdout.cursorTo(0)

  const percent = Util.formatPercent(count / max)

  process.stdout.write(`${count}/${max}( ${percent} )`)
}
