import { ISample } from "shared";

const flaggedUsers = [1663882102141, 1663900040545, 1664485938220];

export function createRow(container: HTMLDivElement, studentName: string, samples: ISample[]) {
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
    sampleContainer.classList.add("sampleContainer");

    const sampleLabel = document.createElement("div");
    sampleLabel.innerHTML = label;
    sampleContainer.appendChild(sampleLabel);

    const img = document.createElement("img");
    img.src = `img/${id}.png`;
    img.classList.add("thumb");

    if (flaggedUsers.includes(student_id)) {
      img.classList.add("blur");
    }

    sampleContainer.appendChild(img);

    row.appendChild(sampleContainer);
  }

  container.appendChild(row);
}
