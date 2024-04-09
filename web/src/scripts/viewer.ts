import { Chart } from "@/chart/chart";
import { Graphics } from "@/chart/graphics";
import { IChartOptions } from "@/chart/types";
import { createRow } from "@/components/display";
import { SketchPad } from "@/components/sketchPad";
import { features } from "@/data/features";
import { minMax } from "@/data/minMax";
import "@/styles/style.css";
import { Feature, ISample, Path, Point, Util, getNearestIndex, normalizePoints } from "shared";

const container = document.getElementById("container") as HTMLDivElement;
const chartContainer = document.getElementById("chartContainer") as HTMLDivElement;
const inputContainer = document.getElementById("inputContainer") as HTMLDivElement;
const predictedContainer = document.getElementById("predictedContainer") as HTMLDivElement;
const toggleButton = document.getElementById("toggleButton") as HTMLButtonElement;

toggleButton.addEventListener("click", toggleInput);

const { featureNames, samples: rawSamples } = features;
const samples = rawSamples.map((s) => ({ ...s, point: new Point(s.point.x, s.point.y) }));

const groups = Util.groupBy(samples, "student_id");

for (const student_id in groups) {
  const groupSamples = groups[student_id];

  // student_id로 groupBy 되었으니까 그룹 내 student_name은 모두 같음
  const { student_name } = groupSamples[0];

  createRow(container, student_name, groupSamples, handleClick);
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
  },
  iconType: "image",
};

Graphics.generateImages(options.styles);

const chart = new Chart(chartContainer, samples, options, handleClick);
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

  const { label, nearestSample } = classify(point);

  if (paths.length) {
    predictedContainer.innerHTML = `Is it a ${label}?`;
  } else {
    predictedContainer.innerHTML = "Draw Something!";
  }

  chart.showDynamicPoint(point, label, nearestSample);
}

function classify(point: Point) {
  const samplePoints = samples.map((s) => s.point);
  const nearestIdx = getNearestIndex(point, samplePoints);
  const nearestSample = samples[nearestIdx];

  return { label: nearestSample.label, nearestSample: nearestSample };
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
