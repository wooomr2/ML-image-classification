import { Draw } from "./draw";
import { Point } from "./point";

export class SketchPad {
  container: HTMLElement;
  size: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  paths: Point[][] = [];
  isDrawing = false;

  constructor(container: HTMLElement, size = 400) {
    this.container = container;
    this.size = size;

    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas.style.background = "white";
    this.canvas.style.boxShadow = "0px 0px 10px 2px black";

    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d")!;

    this.#addEventListeners();
  }

  #addEventListeners() {
    // Mouse events
    {
      this.canvas.onmousedown = (evt) => {
        const point = this.#getPoint(evt);

        this.paths.push([point]);
        this.isDrawing = true;
      };

      this.canvas.onmousemove = (evt) => {
        if (this.isDrawing) {
          const point = this.#getPoint(evt);

          const lastPath = this.paths.at(-1)!;
          lastPath.push(point);

          this.#redraw();
        }
      };

      this.canvas.onmouseup = () => {
        this.isDrawing = false;
      };
    }

    // Touch events
    {
      this.canvas.ontouchstart = (evt) => {
        const point = this.#getPoint(evt.touches[0]);

        this.paths.push([point]);
        this.isDrawing = true;
      };

      this.canvas.ontouchmove = (evt) => {
        if (this.isDrawing) {
          const point = this.#getPoint(evt.touches[0]);

          const lastPath = this.paths.at(-1)!;
          lastPath.push(point);

          this.#redraw();
        }
      };

      this.canvas.ontouchend = () => {
        this.isDrawing = false;
      };
    }
  }

  #redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Draw.paths(this.ctx, this.paths);
  }

  #getPoint(evt: MouseEvent | Touch): Point {
    const rect = this.canvas.getBoundingClientRect();

    const point = new Point(
      Math.round(evt.clientX - rect.left),
      Math.round(evt.clientY - rect.top)
    );

    return point;
  }
}
