import { getNearestIndices } from '../maths/basic'
import { Point } from '../primitives/point'
import { IPrediction, ISample } from '../types'

export class KNN {
  constructor(
    readonly samples: ISample[],
    readonly k: number
  ) {
    this.samples = samples
    this.k = k
  }

  predict(point: Point): IPrediction {
    const { samples, k } = this

    const samplePoints = samples.map(s => s.point)
    const nearestIndices = getNearestIndices(point, samplePoints, k)

    const nearestSamples = nearestIndices.map(i => samples[i])
    const labels = nearestSamples.map(s => s.label)

    const counts: Record<string, number> = {}
    for (const label of labels) {
      counts[label] = (counts[label] || 0) + 1
    }
    const max = Math.max(...Object.values(counts))

    const label = labels.find(l => counts[l] === max)!

    return { label: label, nearestSamples: nearestSamples }
  }
}
