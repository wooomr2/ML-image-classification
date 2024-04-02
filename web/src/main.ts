import { Point } from "./point";
import { SketchPad } from "./sketchPad";
import "./style.css";

let index = 0;
const labels = ["car", "fish", "house", "tree", "bicycle", "guitar", "pencil", "clock"];

interface IData {
  student: string | null;
  session: number;
  drawings: Record<string, Point[][]>;
}

const data: IData = {
  student: null,
  session: new Date().getTime(),
  drawings: {},
};

const sketchPadContainer = document.getElementById("sketchPadContainer") as HTMLDivElement;
const studentInput = document.getElementById("studentInput") as HTMLInputElement | null;
const instructions = document.getElementById("instructions") as HTMLParagraphElement;
const advanceBtn = document.getElementById("advanceBtn") as HTMLButtonElement;

advanceBtn.onclick = start;

const sketchPad = new SketchPad(sketchPadContainer);

function start() {
  if (!studentInput?.value) {
    return alert("Please enter your name");
  }

  data.student = studentInput.value;

  studentInput.style.display = "none";
  sketchPadContainer.style.visibility = "visible";

  instructions.innerHTML = `Please draw a ${labels[index]}`;

  advanceBtn.innerHTML = "NEXT";
  advanceBtn.onclick = next;
}

function next() {
  if (sketchPad.paths.length == 0) {
    return alert("Please draw something");
  }

  data.drawings[labels[index]] = sketchPad.paths;
  sketchPad.reset();

  index++; // Move to the next label
  if (index < labels.length) {
    instructions.innerHTML = `Please draw a ${labels[index]}`;
  } else {
    sketchPadContainer.style.display = "hidden";
    instructions.innerHTML = "Thank you for participating!";
    advanceBtn.innerHTML = "SAVE";

    advanceBtn.onclick = save;
  }
}

function save() {
  advanceBtn.style.display = "none";
  instructions.innerHTML = "data saved!";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  );

  const fileName = `${data.session}.json`;
  element.setAttribute("download", fileName);

  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
