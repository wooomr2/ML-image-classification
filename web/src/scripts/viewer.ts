import { Chart } from "@/chart/chart";
import { Graphics } from "@/chart/graphics";
import { IChartOptions } from "@/chart/types";
import { createRow } from "@/components/display";
import { features } from "@/data/features";
import "@/styles/style.css";
import { ISample, Util } from "shared";

const { featureNames, samples } = features;
const groups = Util.groupBy(samples, "student_id");

const container = document.getElementById("container") as HTMLDivElement;
const chartContainer = document.getElementById("chartContainer") as HTMLDivElement;

for (const student_id in groups) {
  const samples = groups[student_id];

  // student_id로 groupBy 되었으니까 그룹 내 student_name은 모두 같음
  const { student_name } = samples[0];

  createRow(container, student_name, samples as ISample[], handleClick);
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

const chart = new Chart(chartContainer, samples as ISample[], options, handleClick);

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
