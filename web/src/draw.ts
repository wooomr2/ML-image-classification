import { Point } from "./point";

export class Draw {
  static path(ctx: CanvasRenderingContext2D, path: Point[], color = "black") {
    if (path.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.stroke();
  }

  static paths(ctx: CanvasRenderingContext2D, paths: Point[][], color = "black") {
    for (const path of paths) {
      Draw.path(ctx, path, color);
    }
  }
}
