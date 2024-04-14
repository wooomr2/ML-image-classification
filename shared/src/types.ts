import { IMAGE_LABELS } from './const'

export interface ICoincidentBox {
  width: number
  height: number
  vertices: Point[]
}

export interface IBoundingBox {
  width: number
  height: number
  vertices: Point[]
  hull: Point[]
}

export interface IBoundary {
  left: number
  right: number
  top: number
  bottom: number
}

export type Point = number[]
export type Path = Point[]

export type TLabel = (typeof IMAGE_LABELS)[number]
export interface IRawData {
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
  correct: boolean
}

export interface IFeatures {
  featureNames: string[]
  samples: ISample[]
}

export interface IPrediction {
  label: string
}
export interface IKnnPrediction extends IPrediction {
  label: string
  nearestSamples: ISample[]
}

export interface IMlpPrediction extends IPrediction {
  label: string
}

export abstract class IClassifier {
  abstract predict(point: Point): IPrediction
}
