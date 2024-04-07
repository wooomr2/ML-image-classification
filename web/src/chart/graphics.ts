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
        ["gray", 0],
        ["red", 60],
        ["yellow", 120],
        ["green", 180],
        ["cyan", 240],
        ["blue", 300],
        ["magenta", 360],
      ]);

      const hue = colorHueMap.get(style.color);
      if (hue) {
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
      loc.x - image.width / 2,
      loc.y - image.height / 2,
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
    ctx.fillText(text, loc.x, loc.y);
  }

  static drawPoint(
    ctx: CanvasRenderingContext2D,
    loc: Point,
    color: string | CanvasGradient,
    size = 5
  ) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(loc.x, loc.y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
