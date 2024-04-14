import { Level, NeuralNetwork, Util, lerp } from "shared";

export class Visualizer {
  static drawNetwork(
    ctx: CanvasRenderingContext2D,
    network: NeuralNetwork,
    outputLabels: CanvasImageSource[] = []
  ) {
    const margin = 50;
    const left = margin;
    const top = margin;
    const width = ctx.canvas.width - margin * 2;
    const height = ctx.canvas.height - margin * 2;

    const levelHeight = height / network.levels.length;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = network.levels.length - 1; i >= 0; i--) {
      const levelTop =
        top +
        lerp(
          height - levelHeight,
          0,
          network.levels.length == 1 ? 0.5 : i / (network.levels.length - 1)
        );

      ctx.setLineDash([7, 3]);
      Visualizer.drawLevel(
        ctx,
        network.levels[i],
        left,
        levelTop,
        width,
        levelHeight,
        i == network.levels.length - 1 ? outputLabels : []
      );
    }
  }

  static drawLevel(
    ctx: CanvasRenderingContext2D,
    level: Level,
    left: number,
    top: number,
    width: number,
    height: number,
    outputLabels: CanvasImageSource[]
  ) {
    const right = left + width;
    const bottom = top + height;
    const nodeRadius = 18;
    const { inputs, outputs, weights, biases } = level;

    // line
    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < outputs.length; j++) {
        const xi = Visualizer.#getNodeX(inputs, i, left, right);
        const xj = Visualizer.#getNodeX(outputs, j, left, right);

        ctx.beginPath();
        ctx.moveTo(xi, bottom);
        ctx.lineTo(xj, top);
        ctx.lineWidth = 2;
        ctx.strokeStyle = Util.getRGBA(weights[i][j]);
        ctx.stroke();
      }
    }

    // input node
    for (let i = 0; i < inputs.length; i++) {
      const x = Visualizer.#getNodeX(inputs, i, left, right);

      ctx.beginPath();
      ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = Util.getRGBA(inputs[i]);
      ctx.fill();
    }

    for (let i = 0; i < outputs.length; i++) {
      const x = Visualizer.#getNodeX(outputs, i, left, right);

      // ouput node
      ctx.beginPath();
      ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = Util.getRGBA(outputs[i]);
      ctx.fill();

      // bias
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = Util.getRGBA(biases[i]);
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (outputLabels[i]) {
        const size = nodeRadius * 1.2;

        ctx.drawImage(outputLabels[i], x - size / 2, top - size / 2 + size * 0.04, size, size);
      }
    }
  }

  static #getNodeX(nodes: number[], index: number, left: number, right: number) {
    return lerp(left, right, nodes.length == 1 ? 0.5 : index / (nodes.length - 1));
  }
}
