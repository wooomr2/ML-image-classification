import { SketchPad } from "@/components/sketchPad";
import "@/styles/style.css";
import { IMAGE_LABELS, IPreProcessedData } from "shared";

const sketchPadContainer = document.getElementById("sketchPadContainer") as HTMLDivElement;
const studentInput = document.getElementById("studentInput") as HTMLInputElement | null;
const instructions = document.getElementById("instructions") as HTMLParagraphElement;
const advanceBtn = document.getElementById("advanceBtn") as HTMLButtonElement;

advanceBtn.onclick = start;

const sketchPad = new SketchPad(sketchPadContainer);

let index = 0;
const data: IPreProcessedData = {
  student: "",
  session: new Date().getTime(),
  drawings: {
    car: [],
    fish: [],
    house: [],
    tree: [],
    bicycle: [],
    guitar: [],
    pencil: [],
    clock: [],
  },
};

function start() {
  if (!studentInput?.value) {
    return alert("Please enter your name");
  }

  data.student = studentInput.value;

  studentInput.style.display = "none";
  sketchPadContainer.style.visibility = "visible";

  instructions.innerHTML = `Please draw a ${IMAGE_LABELS[index]}`;
  instructions.style.display = "initial";

  advanceBtn.innerHTML = "NEXT";
  advanceBtn.onclick = next;
}

function next() {
  if (sketchPad.paths.length == 0) {
    return alert("Please draw something");
  }

  data.drawings[IMAGE_LABELS[index]] = sketchPad.paths;
  sketchPad.reset();

  index++; // Move to the next label
  if (index < IMAGE_LABELS.length) {
    instructions.innerHTML = `Please draw a ${IMAGE_LABELS[index]}`;
  } else {
    sketchPadContainer.style.visibility = "hidden";
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
    "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  );

  const fileName = `${data.session}.json`;
  element.setAttribute("download", fileName);

  element.click();
}
