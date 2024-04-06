import { features } from "@/data/features";
import { createRow } from "@/components/display";
import "@/styles/style.css";
import { ISample, Util } from "shared";

const { featureNames, samples } = features;
const groups = Util.groupBy(samples, "student_id");

const container = document.getElementById("container") as HTMLDivElement;

for (const student_id in groups) {
  const samples = groups[student_id];

  // student_id로 groupBy 되었으니까 그룹 내 student_name은 모두 같음
  const { student_name } = samples[0];

  createRow(container, student_name, samples as ISample[]);
}
