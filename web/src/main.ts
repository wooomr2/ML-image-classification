import { SketchPad } from "./sketchPad";
import "./style.css";

const sketchPadContainer = document.getElementById("sketchPadContainer") as HTMLDivElement;
const studentInput = document.getElementById("studentInput") as HTMLInputElement | null;
const advanceBtn = document.getElementById("advanceBtn") as HTMLButtonElement;

advanceBtn.addEventListener("click", (e) => {
  e.preventDefault();
  start();
});

const sketchPad = new SketchPad(sketchPadContainer);

function start() {
  if (!studentInput?.value) return;

  studentInput.style.display = "none";
  sketchPadContainer.style.visibility = "visible";
}
