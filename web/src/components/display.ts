import { PUBLIC_SOURCE } from "@/const";
import { ISample, ITestingSample, Util } from "shared";

const flaggedUsers = [1663882102141, 1663900040545, 1664485938220];

export const createRow = (
  container: HTMLDivElement,
  studentName: string,
  samples: ISample[] | ITestingSample[],
  handleClick?: (sample: ISample | null, doScroll?: boolean) => void
) => {
  const row = document.createElement("div");
  row.classList.add("row");

  const rowLabel = document.createElement("div");
  rowLabel.innerHTML = studentName;
  rowLabel.classList.add("rowLabel");

  row.appendChild(rowLabel);

  for (const sample of samples) {
    const { id, label, student_id } = sample;

    const sampleContainer = document.createElement("div");
    sampleContainer.id = `sample_${id}`;
    if (handleClick) {
      sampleContainer.onclick = () => handleClick(sample, false);
    }
    sampleContainer.classList.add("sampleContainer");
    if (Util.isTestingSample(sample)) {
      if (sample.correct) {
        sampleContainer.style.backgroundColor = "lightgreen";
      } else {
        sampleContainer.style.backgroundColor = "lightcoral";
      }
    }

    const sampleLabel = document.createElement("div");
    sampleLabel.innerHTML = label;
    sampleContainer.appendChild(sampleLabel);

    const img = document.createElement("img");
    img.src = `${PUBLIC_SOURCE.IMG_DIR}/${id}.png`;
    img.classList.add("thumb");

    if (flaggedUsers.includes(student_id)) {
      img.classList.add("blur");
    }

    sampleContainer.appendChild(img);

    row.appendChild(sampleContainer);
  }

  container.appendChild(row);
};
