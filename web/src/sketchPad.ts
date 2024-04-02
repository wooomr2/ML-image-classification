import { Draw } from "./draw";
import { Point } from "./point";

export class SketchPad {
  size: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  undoBtn: HTMLButtonElement;

  paths: Point[][] = [];
  isDrawing = false;

  constructor(container: HTMLElement, size = 400) {
    this.size = size;

    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas.style.background = "white";
    this.canvas.style.boxShadow = "0px 0px 10px 2px black";

    container.appendChild(this.canvas);
    const lineBreak = document.createElement("br");
    container.appendChild(lineBreak);

    this.undoBtn = document.createElement("button");
    this.undoBtn.textContent = "Undo";
    container.appendChild(this.undoBtn);

    this.ctx = this.canvas.getContext("2d")!;

    this.#redraw();

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

    this.undoBtn.onclick = () => {
      this.paths.pop();
      this.#redraw();
    };
  }

  #redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Draw.paths(this.ctx, this.paths);

    if (this.paths.length > 0) {
      this.undoBtn.disabled = false;
    } else {
      this.undoBtn.disabled = true;
    }
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
