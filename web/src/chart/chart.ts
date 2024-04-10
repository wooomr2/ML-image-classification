import {
  IBoundary,
  ISample,
  Point,
  Util,
  add,
  distance,
  getNearestIndex,
  lerp,
  remapPoint,
  scale,
  subtract,
} from "shared";
import { Graphics } from "./graphics";
import { IChartOptions } from "./types";

export class Chart {
  samples: ISample[];
  options: IChartOptions;
  handleClick?: (sample: ISample | null, doScroll?: boolean) => void;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  overlayCanvas: HTMLCanvasElement;
  overlayCtx: CanvasRenderingContext2D;

  backgroundImage: HTMLImageElement;

  margin: number;

  dataTrans: { offset: Point; scale: number };
  dragInfo: { start: Point; end: Point; offset: Point; dragging: boolean };

  hoveredSample: ISample | null = null;
  selectedSample: ISample | null = null;

  defaultDataBounds: IBoundary;
  dataBounds: IBoundary;
  pixelBounds: IBoundary;

  dynamic: { point: Point; label: string } | null = null;
  nearestSamples: ISample[] | null = null;

  constructor(
    container: HTMLDivElement,
    samples: ISample[],
    options: IChartOptions,
    handleClick?: (sample: ISample | null, doScroll?: boolean) => void
  ) {
    this.samples = samples;
    this.options = options;

    const bgImage = new Image();
    bgImage.src = options.bgImageSrc;
    this.backgroundImage = bgImage;
    this.backgroundImage.onload = () => this.#draw();

    Object.values(this.options.styles).forEach((style) => {
      if (style.image) {
        style.image.onload = () => this.#draw();
      }
    });

    this.handleClick = handleClick;

    this.canvas = document.createElement("canvas");
    this.canvas.width = options.size;
    this.canvas.height = options.size;
    this.canvas.setAttribute("style", "background-color: white;");

    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;

    container.appendChild(this.canvas);

    // for optimization
    this.overlayCanvas = document.createElement("canvas");
    this.overlayCanvas.width = options.size;
    this.overlayCanvas.height = options.size;
    this.overlayCanvas.style.position = "absolute";
    this.overlayCanvas.style.left = "0px";
    this.overlayCanvas.style.pointerEvents = "none";
    container.appendChild(this.overlayCanvas);

    this.overlayCtx = this.overlayCanvas.getContext("2d")!;
    this.overlayCtx.imageSmoothingEnabled = false;

    this.margin = options.size * 0.1;

    this.dataTrans = {
      offset: new Point(0, 0),
      scale: 1,
    };

    this.dragInfo = {
      start: new Point(0, 0),
      end: new Point(0, 0),
      offset: new Point(0, 0),
      dragging: false,
    };

    this.defaultDataBounds = this.#getDataBounds();
    this.dataBounds = this.#getDataBounds();
    this.pixelBounds = this.#getPixelBounds();

    this.#draw();

    this.#addEventListeners();
  }

  selectSample(sample: ISample | null) {
    this.selectedSample = sample;
    this.#drawOverlay();
  }

  showDynamicPoint(point: Point, label: string, nearestSamples: ISample[] | null) {
    this.dynamic = { point, label };
    this.nearestSamples = nearestSamples;
    this.#drawOverlay();
  }

  hideDynamicPoint() {
    this.dynamic = null;
    this.#drawOverlay();
  }

  #addEventListeners() {
    const { canvas, dataTrans, dragInfo, samples, dataBounds, pixelBounds } = this;

    canvas.onmousedown = (evt) => {
      const dataLoc: Point = this.#getMouse(evt, true);

      dragInfo.start = dataLoc;
      dragInfo.dragging = true;
      dragInfo.end = new Point(0, 0);
      dragInfo.offset = new Point(0, 0);
    };

    canvas.onmousemove = (evt) => {
      if (dragInfo.dragging) {
        const dataLoc = this.#getMouse(evt, true);

        dragInfo.end = dataLoc;
        dragInfo.offset = scale(subtract(dragInfo.start, dragInfo.end), dataTrans.scale);

        const newOffset = add(dataTrans.offset, dragInfo.offset);

        this.#updateDataBounds(newOffset, dataTrans.scale);
      }

      {
        const pLoc = this.#getMouse(evt);
        const pPoints = samples.map((s) => remapPoint(dataBounds, pixelBounds, s.point));

        const nearestIndex = getNearestIndex(pLoc, pPoints);
        const nearest = samples[nearestIndex];
        const dist = distance(pLoc, pPoints[nearestIndex]);

        this.hoveredSample = dist < this.margin / 2 ? nearest : null;
      }

      if (dragInfo.dragging) {
        this.#draw();
        this.#drawOverlay();
      } else {
        this.#drawOverlay();
      }
    };

    canvas.onmouseup = () => {
      dataTrans.offset = add(dataTrans.offset, dragInfo.offset);

      dragInfo.dragging = false;
    };

    canvas.onwheel = (evt) => {
      const direction = Math.sign(evt.deltaY);
      const step = 0.02;

      // dataTrans.scale += direction * step;
      // dataTrans.scale = Math.max(step, Math.min(2, dataTrans.scale));

      const scale = 1 + direction * step;
      dataTrans.scale *= scale;

      this.#updateDataBounds(dataTrans.offset, dataTrans.scale);

      this.#draw();
      this.#drawOverlay();

      evt.preventDefault();
    };

    canvas.onclick = () => {
      if (!dragInfo.offset.equals(new Point(0, 0))) {
        return;
      }

      if (this.hoveredSample) {
        if (this.selectedSample == this.hoveredSample) {
          this.selectedSample = null;
        } else {
          this.selectedSample = this.hoveredSample;
        }
      } else {
        this.selectedSample = null;
      }

      if (this.handleClick) {
        this.handleClick(this.selectedSample);
      }

      this.#draw();
      this.#drawOverlay();
    };
  }

  #updateDataBounds(offset: Point, scale: number) {
    const { dataBounds, defaultDataBounds: defaults } = this;

    dataBounds.left = defaults.left + offset.x;
    dataBounds.right = defaults.right + offset.x;
    dataBounds.top = defaults.top + offset.y;
    dataBounds.bottom = defaults.bottom + offset.y;

    const center = new Point(
      dataBounds.left + dataBounds.right / 2,
      dataBounds.top + dataBounds.bottom / 2
    );

    // R^2 Space이므로 scale^2
    dataBounds.left = lerp(center.x, dataBounds.left, scale ** 2);
    dataBounds.right = lerp(center.x, dataBounds.right, scale ** 2);
    dataBounds.top = lerp(center.y, dataBounds.top, scale ** 2);
    dataBounds.bottom = lerp(center.y, dataBounds.bottom, scale ** 2);
  }

  #getMouse(evt: MouseEvent, dataSpace = false): Point {
    const { canvas, pixelBounds, defaultDataBounds } = this;

    const rect = canvas.getBoundingClientRect();
    const pixelLoc = new Point(evt.clientX - rect.left, evt.clientY - rect.top);

    if (dataSpace) {
      const dataLoc = remapPoint(pixelBounds, defaultDataBounds, pixelLoc);
      return dataLoc;
    }

    return pixelLoc;
  }

  #getDataBounds(): IBoundary {
    const { samples } = this;
    const xs = samples.map((s) => s.point.x);
    const ys = samples.map((s) => s.point.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // const deltaX = maxX - minX;
    // const deltaY = maxY - minY;
    // const deltaMax = Math.max(deltaX, deltaY);

    const bounds: IBoundary = {
      left: minX,
      right: maxX, // minX + deltaMax
      top: maxY, // maxY + deltaMax,
      bottom: minY,
    };

    return bounds;
  }

  #getPixelBounds(): IBoundary {
    const { canvas, margin } = this;
    const bounds: IBoundary = {
      left: margin,
      right: canvas.width - margin,
      top: margin,
      bottom: canvas.height - margin,
    };

    return bounds;
  }

  #draw() {
    const { ctx, canvas, samples, options, dataBounds, pixelBounds, backgroundImage } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Decision Boundary Background Image:: 로드 후 그려야함
    if (backgroundImage) {
      const topLeft = remapPoint(dataBounds, pixelBounds, new Point(0, 1));
      const bottomRight = remapPoint(dataBounds, pixelBounds, new Point(1, 0));
      ctx.drawImage(
        backgroundImage,
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
    }

    ctx.globalAlpha = options.transparency ?? 1;

    this.#drawSamples(samples, ctx);

    ctx.globalAlpha = 1;

    this.#drawAxes(ctx);
  }

  #drawOverlay() {
    const {
      overlayCtx,
      overlayCanvas,
      hoveredSample,
      selectedSample,
      nearestSamples,
      dynamic,
      dataBounds,
      pixelBounds,
      options,
    } = this;

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (hoveredSample) {
      this.#emphasizeSample(hoveredSample);
    }

    if (selectedSample) {
      this.#emphasizeSample(selectedSample, "yellow");
    }

    if (dynamic) {
      const pixelLoc = remapPoint(dataBounds, pixelBounds, dynamic.point);
      if (nearestSamples) {
        this.#showNearestLines(pixelLoc);
      }

      Graphics.drawPoint(overlayCtx, pixelLoc, "rgba(255,255,255,0.7)", 10000);
      Graphics.drawImage(overlayCtx, {
        image: options.styles[dynamic.label].image!,
        loc: pixelLoc,
      });
    }

    this.#drawAxes(overlayCtx);
  }

  #showNearestLines(pixelLoc: Point) {
    const { nearestSamples, dataBounds, pixelBounds } = this;

    if (!nearestSamples) return;

    this.overlayCtx.strokeStyle = "gray";
    for (const nSample of nearestSamples) {
      const point = remapPoint(dataBounds, pixelBounds, nSample.point);
      this.overlayCtx.beginPath();
      this.overlayCtx.moveTo(pixelLoc.x, pixelLoc.y);
      this.overlayCtx.lineTo(point.x, point.y);
      this.overlayCtx.stroke();
    }
  }

  #emphasizeSample(sample: ISample, color = "white") {
    const { overlayCtx, dataBounds, pixelBounds, margin } = this;
    const pLoc = remapPoint(dataBounds, pixelBounds, sample.point);

    const gradient = overlayCtx.createRadialGradient(pLoc.x, pLoc.y, 0, pLoc.x, pLoc.y, margin);

    gradient.addColorStop(0, color);
    // white: rgb(0,0,0), black: rgb(255,255,255)
    // alpha: 0: 완전투명 ~ 1: 완전불투명
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    Graphics.drawPoint(overlayCtx, pLoc, gradient, margin * 2);

    this.#drawSamples([sample], overlayCtx);
  }

  #drawAxes(ctx: CanvasRenderingContext2D) {
    const { canvas, pixelBounds, dataBounds, options, margin } = this;
    const { left, right, top, bottom } = pixelBounds;

    // clear outside points
    {
      ctx.clearRect(0, 0, canvas.width, margin);
      ctx.clearRect(0, 0, margin, canvas.height);
      ctx.clearRect(canvas.width - margin, 0, margin, canvas.height);
      ctx.clearRect(0, canvas.height - margin, canvas.width, margin);
    }

    // x-axis label
    Graphics.drawText(ctx, {
      text: options.axesLabels[0],
      loc: new Point(canvas.width / 2, bottom + margin / 2),
      size: margin * 0.6,
    });

    ctx.save();
    ctx.translate(left - margin / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);

    // y-axis label
    Graphics.drawText(ctx, {
      text: options.axesLabels[1],
      loc: new Point(0, 0),
      size: margin * 0.6,
    });

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "lightgray";
    ctx.stroke();
    ctx.setLineDash([]);

    {
      const dataMin: Point = remapPoint(pixelBounds, dataBounds, new Point(left, bottom));

      Graphics.drawText(ctx, {
        text: Util.formatNumber(dataMin.x, 2),
        loc: new Point(left, bottom),
        size: margin * 0.3,
        align: "left",
        vAlign: "top",
      });

      ctx.save();
      ctx.translate(left, bottom);
      ctx.rotate(-Math.PI / 2);

      Graphics.drawText(ctx, {
        text: Util.formatNumber(dataMin.y, 2),
        loc: new Point(0, 0),
        size: margin * 0.3,
        align: "left",
        vAlign: "bottom",
      });

      ctx.restore();
    }

    {
      const dataMax = remapPoint(pixelBounds, dataBounds, new Point(right, top));

      Graphics.drawText(ctx, {
        text: Util.formatNumber(dataMax.x, 2),
        loc: new Point(right, bottom),
        size: margin * 0.3,
        align: "right",
        vAlign: "top",
      });

      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(-Math.PI / 2);

      Graphics.drawText(ctx, {
        text: Util.formatNumber(dataMax.y, 2),
        loc: new Point(0, 0),
        size: margin * 0.3,
        align: "right",
        vAlign: "bottom",
      });

      ctx.restore();
    }
  }

  #drawSamples(samples: ISample[], ctx: CanvasRenderingContext2D) {
    const { dataBounds, pixelBounds, options } = this;

    if (options.hideSamples) return;

    for (const sample of samples) {
      const { point, label } = sample;

      // -------- x
      // |  x: left=>right
      // |  y: top=>bottom
      // y
      const pixelLoc = remapPoint(dataBounds, pixelBounds, point);

      switch (options.iconType) {
        case "image":
          Graphics.drawImage(ctx, {
            image: options.styles[label].image!,
            loc: pixelLoc,
          });
          break;
        case "text":
          Graphics.drawText(ctx, {
            text: options.styles[label].text,
            loc: pixelLoc,
          });
          break;
        default:
          Graphics.drawPoint(ctx, pixelLoc, options.styles[label].color);
          break;
      }
    }
  }
}
