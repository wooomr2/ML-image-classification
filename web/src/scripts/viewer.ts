import { Chart } from "@/chart/chart";
import { Graphics } from "@/chart/graphics";
import { IChartOptions } from "@/chart/types";
import { createRow } from "@/components/display";
import { SketchPad } from "@/components/sketchPad";
import { minMax } from "@/data/minMax";
import { testing } from "@/data/testing";
import { training } from "@/data/training";
import "@/styles/style.css";
import {
  Feature,
  ISample,
  ITestingSample,
  Path,
  Point,
  Util,
  getNearestIndices,
  normalizePoints,
} from "shared";

const container = document.getElementById("container") as HTMLDivElement;
const chartContainer = document.getElementById("chartContainer") as HTMLDivElement;
const inputContainer = document.getElementById("inputContainer") as HTMLDivElement;
const predictedContainer = document.getElementById("predictedContainer") as HTMLDivElement;
const toggleButton = document.getElementById("toggleButton") as HTMLButtonElement;
const statistics = document.getElementById("statistics") as HTMLDivElement;

toggleButton.addEventListener("click", toggleInput);

const featureNames = training.featureNames;
const trainingSamples: ISample[] = training.samples.map((s) => ({
  ...s,
  point: new Point(s.point.x, s.point.y),
}));

const k = 50;
let totalCount = 0;
let correctCount = 0;

const testingSamples: ITestingSample[] = testing.samples.map((s) => {
  const point = new Point(s.point.x, s.point.y);
  const { label } = classify(point);
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
}

const options: IChartOptions = {
  size: 400,
  axesLabels: featureNames,
  styles: {
    car: { color: "gray", text: "🚗" },
    fish: { color: "red", text: "🐠" },
    house: { color: "yellow", text: "🏠" },
    tree: { color: "green", text: "🌳" },
    bicycle: { color: "cyan", text: "🚲" },
    guitar: { color: "blue", text: "🎸" },
    pencil: { color: "magenta", text: "✏️" },
    clock: { color: "lightgray", text: "🕒" },
    "?": { color: "red", text: "❓" },
  },
  iconType: "image",
};

Graphics.generateImages(options.styles);

const chart = new Chart(chartContainer, trainingSamples, options, handleClick);
const sketchPad = new SketchPad(inputContainer, onDrawingUpdate, options.size - 50);
sketchPad.canvas.style.cssText += "outline:10000px solid rgba(0,0,0,0.7);";

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
  const featureFuncs = Feature.inUse.map((f) => f.function);

  const point = new Point(featureFuncs[0](paths), featureFuncs[1](paths));
  normalizePoints([point], minMax);

  const { label, nearestSamples } = classify(point);

  if (paths.length) {
    predictedContainer.innerHTML = `Is it a ${label}?`;
  } else {
    predictedContainer.innerHTML = "Draw Something!";
  }

  chart.showDynamicPoint(point, label, nearestSamples);
}

function classify(point: Point) {
  const samplePoints = trainingSamples.map((s) => s.point);
  const nearestIndices = getNearestIndices(point, samplePoints, k);

  const nearestSamples = nearestIndices.map((i) => trainingSamples[i]);
  const labels = nearestSamples.map((s) => s.label);

  const counts: Record<string, number> = {};
  for (const label of labels) {
    counts[label] = (counts[label] || 0) + 1;
  }
  const max = Math.max(...Object.values(counts));

  const label = labels.find((l) => counts[l] === max)!;

  return { label: label, nearestSamples: nearestSamples };
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
