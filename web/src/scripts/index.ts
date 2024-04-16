import { Chart } from "@/chart/chart";
import { Confusion } from "@/chart/confusion";
import { Graphics } from "@/chart/graphics";
import { IChartOptions } from "@/chart/types";
import { Visualizer } from "@/chart/visualizer";
import { createRow, toggleFlaggedSample } from "@/components/display";
import { SketchPad } from "@/components/sketchPad";
import { PUBLIC_SOURCE } from "@/constants";
import { minMax } from "@/data/minMax";
import { model } from "@/data/model";
import { testing } from "@/data/testing";
import { training } from "@/data/training";
import "@/styles/style.css";
import {
  Feature,
  IMAGE_LABELS,
  IMAGE_STYLES,
  ISample,
  ITestingSample,
  MLP,
  Path,
  Util,
  normalizePoints,
} from "shared";

const container = document.getElementById("container") as HTMLDivElement;
const chartContainer = document.getElementById("chartContainer") as HTMLDivElement;
const confusionContainer = document.getElementById("confusionContainer") as HTMLDivElement;
const inputContainer = document.getElementById("inputContainer") as HTMLDivElement;
const predictedContainer = document.getElementById("predictedContainer") as HTMLDivElement;
const toggleInputButton = document.getElementById("toggleInputButton") as HTMLButtonElement;
const toggleOutputButton = document.getElementById("toggleOutputButton") as HTMLButtonElement;
const statistics = document.getElementById("statistics") as HTMLDivElement;
const networkCanvas = document.getElementById("networkCanvas") as HTMLCanvasElement;

toggleInputButton.addEventListener("click", toggleInput);
toggleOutputButton.addEventListener("click", toggleOutput);

const featureNames = training.featureNames;
const trainingSamples: ISample[] = training.samples;

// const k = 50;
// const knn = new KNN(trainingSamples, k);

const mlp = new MLP([], []);
mlp.load(model as MLP);

let totalCount = 0;
let correctCount = 0;

const testingSamples: ITestingSample[] = testing.samples.map((s) => {
  // const { label } = knn.predict(s.point);
  const { label } = mlp.predict(s.point);
  const isCorrect = s.label == label;

  totalCount++;
  correctCount += isCorrect ? 1 : 0;

  return {
    ...s,
    label: label ?? "?",
    point: s.point,
    truth: s.label,
    correct: isCorrect,
  };
});

statistics.innerHTML = `<b>Accuracy:</b> ${correctCount}/${totalCount}(${Util.formatPercent(
  correctCount / totalCount
)})`;

// display samples
{
  const trainingGroups = Util.groupBy(trainingSamples, "student_id");
  for (const student_id in trainingGroups) {
    const groupSamples = trainingGroups[student_id];

    createRow(container, groupSamples[0].student_name, groupSamples, handleClick);
  }

  const subtitle = document.createElement("h2");
  subtitle.innerHTML = "Testing Samples";
  container.appendChild(subtitle);

  const testingGroups = Util.groupBy(testingSamples, "student_id");
  for (const student_id in testingGroups) {
    const groupSamples = testingGroups[student_id];

    createRow(container, groupSamples[0].student_name, groupSamples, handleClick);
  }

  toggleFlaggedSample();
}

const options: IChartOptions = {
  size: 480,
  axesLabels: featureNames,
  styles: IMAGE_STYLES,
  iconType: "image",
  bgImageSrc: PUBLIC_SOURCE.DECISION_BOUNDARY,
  transparency: 0.9,
  hideSamples: false,
};

Graphics.generateImages(options.styles);

const outputLabels = Object.values(options.styles).map((style) => style.image!);

networkCanvas.width = options.size;
networkCanvas.height = options.size;
const networkCtx = networkCanvas.getContext("2d", { willReadFrequently: true })!;

Visualizer.drawNetwork(networkCtx, mlp.network, outputLabels);

const tmpCanvas = document.createElement("canvas");
const tmpCtx = tmpCanvas.getContext("2d", { willReadFrequently: true })!;
tmpCanvas.style.display = "none";
tmpCanvas.width = 20;
tmpCanvas.height = 20;

const chart = new Chart(chartContainer, trainingSamples, options, handleClick);
const confusion = new Confusion(confusionContainer, testingSamples, [...IMAGE_LABELS], options);
const sketchPad = new SketchPad(inputContainer, onDrawingUpdate, options.size);
sketchPad.canvas.style.cssText += "outline:10000px solid rgba(255,255,255,0.7);";

function handleClick(sample: ISample | null, doScroll = true) {
  if (!sample) {
    document.querySelectorAll(".emphasize").forEach((el) => el.classList.remove("emphasize"));
    return;
  }

  const el = document.getElementById(`sample_${sample?.id}`);

  if (el?.classList.contains("emphasize")) {
    el.classList.remove("emphasize");
    chart.selectSample(null);
    return;
  }

  document.querySelectorAll(".emphasize").forEach((el) => el.classList.remove("emphasize"));

  el?.classList.add("emphasize");
  chart.selectSample(sample);
  console.log(sample);

  if (doScroll) {
    el?.scrollIntoView({ behavior: "auto", block: "center" });
  }
}

function onDrawingUpdate(paths: Path[]) {
  tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);

  // const point = Feature.inUse.map((f) => f.function(paths));
  // const point = Feature.inUse.map((f) => f.function(paths, tmpCtx));
  const point = Object.values(Feature.getPixelIntensities(paths, tmpCtx));

  normalizePoints([point], minMax);

  // const { label, nearestSamples } = knn.predict(point);
  const { label } = mlp.predict(point);
  Visualizer.drawNetwork(networkCtx, mlp.network, outputLabels);

  if (paths.length) {
    predictedContainer.innerHTML = `Is it a ${label}?`;
  } else {
    predictedContainer.innerHTML = "Draw Something!";
  }

  // chart.showDynamicPoint(point, label, nearestSamples);
  if (inputContainer.style.display == "block") {
    chart.showDynamicPoint(point, label, null);
  }
}

function toggleInput() {
  if (inputContainer.style.display == "none") {
    inputContainer.style.display = "block";
    sketchPad.triggerUpdate();
  } else {
    inputContainer.style.display = "none";
    chart.hideDynamicPoint();
  }
}

function toggleOutput() {
  if (networkCanvas.style.display == "block") {
    networkCanvas.style.display = "none";
    confusionContainer.style.display = "block";
  } else if (confusionContainer.style.display == "block") {
    confusionContainer.style.display = "none";
  } else {
    confusionContainer.style.display = "block";
    networkCanvas.style.display = "block";
  }
}
