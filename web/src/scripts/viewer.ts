import { Chart } from "@/chart/chart";
import { Confusion } from "@/chart/confusion";
import { Graphics } from "@/chart/graphics";
import { IChartOptions } from "@/chart/types";
import { createRow, toggleFlaggedSample } from "@/components/display";
import { SketchPad } from "@/components/sketchPad";
import { PUBLIC_SOURCE } from "@/const";
import { minMax } from "@/data/minMax";
import { testing } from "@/data/testing";
import { training } from "@/data/training";
import "@/styles/style.css";
import {
  Feature,
  IMAGE_LABELS,
  IMAGE_STYLES,
  ISample,
  ITestingSample,
  KNN,
  Path,
  Point,
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

toggleInputButton.addEventListener("click", toggleInput);
toggleOutputButton.addEventListener("click", toggleOutput);

const featureNames = training.featureNames;
const trainingSamples: ISample[] = training.samples.map((s) => ({
  ...s,
  point: new Point(s.point.x, s.point.y),
}));

const k = 50;
const kNN = new KNN(trainingSamples, k);
let totalCount = 0;
let correctCount = 0;

const testingSamples: ITestingSample[] = testing.samples.map((s) => {
  const point = new Point(s.point.x, s.point.y);

  const { label } = kNN.predict(point);
  const isCorrect = s.label == label;

  totalCount++;
  correctCount += isCorrect ? 1 : 0;

  return {
    ...s,
    label: label ?? "?",
    point: point,
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

const chart = new Chart(chartContainer, trainingSamples, options, handleClick);
const confusion = new Confusion(confusionContainer, testingSamples, [...IMAGE_LABELS], options);
const sketchPad = new SketchPad(inputContainer, onDrawingUpdate, options.size - 50);
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
  const results = Feature.inUse.map((f) => f.function(paths));
  const point = new Point(results[0], results[1]);

  normalizePoints([point], minMax);

  const { label, nearestSamples } = kNN.predict(point);

  if (paths.length) {
    predictedContainer.innerHTML = `Is it a ${label}?`;
  } else {
    predictedContainer.innerHTML = "Draw Something!";
  }

  chart.showDynamicPoint(point, label, nearestSamples);
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
  if (confusionContainer.style.display == "none") {
    confusionContainer.style.display = "block";
  } else {
    confusionContainer.style.display = "none";
  }
}
