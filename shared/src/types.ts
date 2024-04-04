import { Point } from './primitives/point'

export type TLabel = 'car' | 'fish' | 'house' | 'tree' | 'bicycle' | 'guitar' | 'pencil' | 'clock'

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
