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
    this.canvas.onmousedown = (evt) => {
      const mouse = this.#getMouse(evt);

      this.paths.push([mouse]);
      this.isDrawing = true;
    };

    this.canvas.onmousemove = (evt) => {
      if (this.isDrawing) {
        const mouse = this.#getMouse(evt);

        const lastPath = this.paths.at(-1)!;
        lastPath.push(mouse);

        this.#redraw();
      }
    };

    this.canvas.onmouseup = () => {
      this.isDrawing = false;
    };
  }

  #redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    console.log(this.paths);
    Draw.paths(this.ctx, this.paths);
  }

  #getMouse(evt: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect();

    const mouse = new Point(
      Math.round(evt.clientX - rect.left),
      Math.round(evt.clientY - rect.top)
    );

    return mouse;
  }
}
