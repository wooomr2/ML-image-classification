export type IChartStyles = Record<
  string,
  { color: string; text: string; image?: HTMLImageElement }
>;

export interface IChartOptions {
  size: number;
  axesLabels: string[];
  styles: IChartStyles;
  iconType: "image" | "text" | "point";
  bg: HTMLImageElement;
}
