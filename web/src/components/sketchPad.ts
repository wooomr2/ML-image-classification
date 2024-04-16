import { Draw, Path, Point } from "shared";

export class SketchPad {
  size: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  undoBtn: HTMLButtonElement;

  onUpdate?: (paths: Path[], ctx: CanvasRenderingContext2D) => void;

  paths: Path[] = [];
  isDrawing = false;

  constructor(
    container: HTMLElement,
    onUpdate?: (paths: Path[], ctx: CanvasRenderingContext2D) => void,
    size = 400
  ) {
    this.size = size;

    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas.style.background = "white";
    this.canvas.style.boxShadow = "0px 0px 10px 2px black";
    this.canvas.style.filter = "invert(1)";

    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;

    container.appendChild(this.canvas);
    const lineBreak = document.createElement("br");
    container.appendChild(lineBreak);

    this.undoBtn = document.createElement("button");
    this.undoBtn.textContent = "Undo";
    this.undoBtn.style.position = "relative";
    this.undoBtn.style.zIndex = "1";
    container.appendChild(this.undoBtn);

    this.onUpdate = onUpdate;
    this.reset();

    this.#addEventListeners();
  }

  reset() {
    this.paths = [];
    this.isDrawing = false;
    this.#redraw();
  }

  triggerUpdate() {
    if (this.onUpdate) {
      this.onUpdate(this.paths, this.ctx);
    }
  }

  #addEventListeners() {
    this.canvas.onpointerdown = (evt) => {
      const point = this.#getPoint(evt);
      this.paths.push([point]);
      this.isDrawing = true;

      evt.preventDefault();
    };

    this.canvas.onpointermove = (evt) => {
      if (this.isDrawing) {
        const point = this.#getPoint(evt);

        const lastPath = this.paths.at(-1)!;
        lastPath.push(point);

        this.#redraw();
      }
      evt.preventDefault();
    };

    this.canvas.onpointerup = (evt) => {
      this.isDrawing = false;
      evt.preventDefault();
    };

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

    this.triggerUpdate();
  }

  #getPoint(evt: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect();

    const point = [Math.round(evt.clientX - rect.left), Math.round(evt.clientY - rect.top)];

    return point;
  }
}
