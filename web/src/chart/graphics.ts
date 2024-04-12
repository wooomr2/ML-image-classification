import { Point } from "shared";
import { IChartStyles } from "./types";

export class Graphics {
  static generateImages(styles: IChartStyles, size = 20) {
    for (const label in styles) {
      const style = styles[label];
      const canvas = document.createElement("canvas");
      canvas.width = size + 10;
      canvas.height = size + 10;

      const ctx = canvas.getContext("2d")!;
      ctx.beginPath();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${size}px Courier`;

      const colorHueMap = new Map([
        ["red", 0],
        ["yellow", 60],
        ["green", 120],
        ["cyan", 180],
        ["blue", 240],
        ["magenta", 300],
      ]);

      const hue = colorHueMap.get(style.color);
      if (typeof hue === "number") {
        ctx.filter = `
             brightness(2)
             contrast(0.3)
             sepia(1)
             brightness(0.7)
             hue-rotate(${-45 + hue}deg)
             saturate(3)
             contrast(3)
          `;
      } else {
        ctx.filter = "grayscale(1)";
      }

      ctx.fillText(style.text, canvas.width / 2, canvas.height / 2);

      style["image"] = new Image();
      style["image"].src = canvas.toDataURL();
    }
  }

  static drawImage(
    ctx: CanvasRenderingContext2D,
    { image, loc }: { image: HTMLImageElement; loc: Point }
  ) {
    ctx.beginPath();
    ctx.drawImage(
      image,
      loc[0] - image.width / 2,
      loc[1] - image.height / 2,
      image.width,
      image.height
    );
    ctx.fill();
  }

  static drawText(
    ctx: CanvasRenderingContext2D,
    {
      text,
      loc,
      align = "center",
      vAlign = "middle",
      size = 10,
      color = "black",
    }: {
      text: string;
      loc: Point;
      align?: CanvasTextAlign;
      vAlign?: CanvasTextBaseline;
      size?: number;
      color?: string;
    }
  ) {
    ctx.textAlign = align;
    ctx.textBaseline = vAlign;
    ctx.font = `bold ${size}px Courier`;
    ctx.fillStyle = color;
    ctx.fillText(text, loc[0], loc[1]);
  }

  static drawPoint(
    ctx: CanvasRenderingContext2D,
    loc: Point,
    color: string | CanvasGradient,
    size = 5
  ) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(loc[0], loc[1], size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
