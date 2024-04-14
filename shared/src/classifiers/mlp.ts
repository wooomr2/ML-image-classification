import { NeuralNetwork } from '../network/neural-network'
import { IClassifier, IMlpPrediction, ISample, Point } from '../types'

export class MLP implements IClassifier {
  neuronCounts: number[]
  classes: string[]
  network: NeuralNetwork

  constructor(neuronCounts: number[], classes: string[]) {
    this.neuronCounts = neuronCounts
    this.classes = classes
    this.network = new NeuralNetwork(neuronCounts)
  }

  load(mlp: MLP) {
    this.neuronCounts = mlp.neuronCounts
    this.classes = mlp.classes
    this.network = mlp.network
  }

  predict(point: Point): IMlpPrediction {
    const output = NeuralNetwork.feedForward(point, this.network)

    const max = Math.max(...output)
    const index = output.indexOf(max)

    const label = this.classes[index]

    return { label: label }
  }

  fit(samples: ISample[], tries = 1000) {
    let bestNetwork = this.network
    let bestAccuracy = this.evaluate(samples)

    for (let i = 0; i < tries; i++) {
      this.network = new NeuralNetwork(this.neuronCounts)
      const accuracy = this.evaluate(samples)

      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy
        bestNetwork = this.network
      }
    }

    this.network = bestNetwork
  }

  evaluate(samples: ISample[]): number {
    let correctCount = 0
    for (const sample of samples) {
      const { label } = this.predict(sample.point)
      const isCorrect = sample.label === label

      correctCount += isCorrect ? 1 : 0
    }

    const accuracy = correctCount / samples.length

    return accuracy
  }
}
