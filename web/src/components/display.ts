import { PUBLIC_SOURCE } from "@/constants";
import { ISample, ITestingSample, Util, flaggedSampleIds, flaggedUserIds } from "shared";

/** Data Cleaner */
export function toggleFlaggedSample(sample?: ISample) {
  if (sample) {
    const index = flaggedSampleIds.indexOf(sample.id);
    if (index !== -1) {
      flaggedSampleIds.splice(index, 1);
    } else {
      flaggedSampleIds.push(sample.id);
    }
    console.log(`flaggedSampleIds = ${JSON.stringify(flaggedSampleIds)}`);
  }

  document.querySelectorAll(".flagged").forEach((e) => e.classList.remove("flagged"));

  for (const id of flaggedSampleIds) {
    const el = document.getElementById(`sample_${id}`);
    el?.classList.add("flagged");
  }
}

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
      sampleContainer.onclick = (evt) => {
        if (evt.ctrlKey) {
          toggleFlaggedSample(sample);
        } else {
          handleClick(sample, false);
        }
      };
    }

    sampleContainer.classList.add("sampleContainer");

    if (Util.isTestingSample(sample)) {
      if (sample.correct) {
        sampleContainer.style.backgroundColor = "mediumblue";
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

    if (flaggedUserIds.includes(student_id)) {
      img.classList.add("blur");
    }

    sampleContainer.appendChild(img);

    row.appendChild(sampleContainer);
  }

  container.appendChild(row);
};
