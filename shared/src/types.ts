import { IMAGE_LABELS } from './const'
import { Point } from './primitives/point'

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

export interface ISample {
  id: number
  label: string
  student_id: number
  student_name: string
  paths: Path[]
}
