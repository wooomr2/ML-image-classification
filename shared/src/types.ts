import { Point } from './primitives/point'
import { IMAGE_LABELS } from './const'

export type TLabel = (typeof IMAGE_LABELS)[number]

export type Path = Point[]

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
