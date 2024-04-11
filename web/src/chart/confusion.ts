import { ITestingSample, invLerp } from "shared";
import { IChartOptions, IChartStyles } from "./types";

export class Confusion {
  samples: ITestingSample[];
  classes: string[]; // labels
  size: number;
  styles: IChartStyles;

  N: number;
  cellSize: number;
  matrix: number[][];

  table: HTMLTableElement;

  constructor(
    container: HTMLDivElement,
    samples: ITestingSample[],
    classes: string[],
    options: IChartOptions
  ) {
    this.samples = samples;
    this.classes = classes;
    this.size = options.size;
    this.styles = options.styles;

    this.N = classes.length + 1;
    this.cellSize = this.size / (this.N + 1);
    this.matrix = this.#prepareMatrix(samples);

    this.table = document.createElement("table");
    this.table.style.borderCollapse = "collapse";
    this.table.style.marginLeft = this.cellSize + "px";
    this.table.style.marginTop = this.cellSize + "px";
    container.appendChild(this.table);

    const topText = document.createElement("div");
    topText.innerHTML = "Predicted Class";
    topText.style.position = "absolute";
    topText.style.fontSize = "x-large";
    topText.style.top = "0px";
    topText.style.left = "50%";
    topText.style.transform = "translate(-50%)";
    topText.style.height = this.cellSize + "px";
    topText.style.display = "flex";
    topText.style.alignItems = "center";
    topText.style.marginLeft = this.cellSize / 2 + "px";
    container.appendChild(topText);

    const leftText = document.createElement("div");
    leftText.innerHTML = "True Class";
    leftText.style.position = "absolute";
    leftText.style.fontSize = "x-large";
    leftText.style.top = "50%";
    leftText.style.left = "0px";
    leftText.style.transform = "translate(-50%) rotate(-90deg)";
    leftText.style.height = this.cellSize + "px";
    leftText.style.display = "flex";
    leftText.style.alignItems = "center";
    leftText.style.marginLeft = this.cellSize / 2 + "px";
    container.appendChild(leftText);

    this.#fillTable();
  }

  #prepareMatrix(samples: ITestingSample[]): number[][] {
    const { N, classes } = this;

    const matrix = Array.from({ length: N }, () => Array<number>(N).fill(0));

    for (const sample of samples) {
      const i = classes.indexOf(sample.truth) + 1;
      const j = classes.indexOf(sample.label) + 1;

      matrix[i][j]++;
    }

    // total of each row and column
    for (let i = 1; i < N; i++) {
      for (let j = 1; j < N; j++) {
        matrix[0][j] += matrix[i][j];
        matrix[i][0] += matrix[i][j];
      }
    }

    // true - predicted
    for (let i = 1; i < N; i++) {
      matrix[0][i] -= matrix[i][0];
    }

    return matrix;
  }

  #fillTable() {
    const { N, cellSize, matrix, classes, styles, table } = this;

    for (let i = 0; i < N; i++) {
      const row = document.createElement("tr");
      table.appendChild(row);

      for (let j = 0; j < N; j++) {
        const cell = document.createElement("td");

        // textContent
        {
          if (i == 0) {
            if (j == 0) {
              cell.textContent = "";
            } else {
              const val = matrix[i][j];
              cell.textContent = val > 0 ? `+${val}` : val.toString();
            }
          } else {
            cell.textContent = matrix[i][j].toString();
          }
        }

        // style
        {
          cell.style.width = cellSize + "px";
          cell.style.height = cellSize + "px";
          cell.style.padding = "0";
          cell.style.textAlign = "right";

          // ㅡ
          if (i == 0 && j > 0) {
            cell.style.backgroundImage = `url(${styles[classes[j - 1]].image!.src})`;
            cell.style.backgroundRepeat = "no-repeat";
            cell.style.backgroundPosition = "100% 20%";
            cell.style.verticalAlign = "bottom";
            cell.style.fontWeight = "bold";

            const p = (2 * matrix[i][j]) / matrix[j][i];
            const R = p >= 0 ? p * 255 : 0;
            const G = 0;
            const B = p <= 0 ? -p * 255 : 0;
            cell.style.color = `rgb(${R},${G},${B})`;
          }

          // ㅣ
          if (j == 0 && i > 0) {
            cell.style.backgroundImage = "url(" + styles[classes[i - 1]].image!.src + ")";
            cell.style.backgroundRepeat = "no-repeat";
            cell.style.backgroundPosition = "100% 20%";
            cell.style.verticalAlign = "bottom";
            cell.style.fontWeight = "bold";
          }

          if (i > 0 && j > 0) {
            const values = matrix
              .slice(1)
              .map((arr) => arr.slice(1))
              .flat();

            const min = Math.min(...values);
            const max = Math.max(...values);

            const p = invLerp(min, max, matrix[i][j]);
            if (i == j) {
              cell.style.backgroundColor = `rgba(0, 0, 255, ${p})`;
            } else {
              cell.style.backgroundColor = `rgba(255, 0, 0, ${p})`;
            }
          }
        }

        row.appendChild(cell);
      }
    }
  }
}
