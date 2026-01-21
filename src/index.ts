import "./styles/glint.css";

import { defineButton } from "./components/button/define.js";
import { defineCard } from "./components/card/define.js";
import { defineCheckbox } from "./components/checkbox/define.js";
import { defineInput } from "./components/input/define.js";
import { defineRadio } from "./components/radio/define.js";
import { defineSelect } from "./components/select/define.js";

export { defineButton, GlButton } from "./components/button/define.js";
export { defineCard, GlCard } from "./components/card/define.js";
export { defineInput, GlInput } from "./components/input/define.js";
export { defineSelect, GlSelect } from "./components/select/define.js";
export { defineCheckbox, GlCheckbox } from "./components/checkbox/define.js";
export { defineRadio, GlRadio } from "./components/radio/define.js";

export function defineGlint(): void {
  defineButton();
  defineCard();
  defineInput();
  defineSelect();
  defineCheckbox();
  defineRadio();
}

declare global {
  interface Window {
    Glint?: {
      define: () => void;
    };
  }
}

if (typeof window !== "undefined") {
  window.Glint = window.Glint ?? { define: defineGlint };
  defineGlint();
}


