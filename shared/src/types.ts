import { IMAGE_LABELS } from './const'
import { Point } from './primitives/point'

export interface IBoundary {
  left: number
  right: number
  top: number
  bottom: number
}

export type Path = Point[]

export type TLabel = (typeof IMAGE_LABELS)[number]
export interface IRawData {
  session: number
  student: string
  drawings: Record<TLabel, [number, number][][]>
}

export interface IPreProcessedData {
  session: number
  student: string
  drawings: Record<TLabel, Path[]>
}

export interface ISample {
  id: number
  label: string
  student_id: number
  student_name: string
  point: Point
}

export interface ITestingSample extends ISample {
  truth: string
  //nearestSamples: ISample[]
  correct: boolean
}

export interface IFeatures {
  featureNames: string[]
  samples: ISample[]
}

export interface IPrediction {
  label: string
  nearestSamples: ISample[]
}
