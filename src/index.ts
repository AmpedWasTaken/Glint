import "./styles/glint.css";

import { defineButton } from "./components/button/define.js";
import { defineCard } from "./components/card/define.js";
import { defineCheckbox } from "./components/checkbox/define.js";
import { defineInput } from "./components/input/define.js";
import { defineRadio } from "./components/radio/define.js";
import { defineSelect } from "./components/select/define.js";
import { defineTooltip } from "./components/tooltip/define.js";
import { defineAccordion } from "./components/accordion/define.js";
import { defineTabs } from "./components/tabs/define.js";

export { defineButton, GlButton } from "./components/button/define.js";
export { defineCard, GlCard } from "./components/card/define.js";
export { defineInput, GlInput } from "./components/input/define.js";
export { defineSelect, GlSelect } from "./components/select/define.js";
export { defineCheckbox, GlCheckbox } from "./components/checkbox/define.js";
export { defineRadio, GlRadio } from "./components/radio/define.js";
export { defineTooltip, GlTooltip } from "./components/tooltip/define.js";
export { defineAccordion, GlAccordion, GlAccordionItem } from "./components/accordion/define.js";
export { defineTabs, GlTabs, GlTab, GlTabPanel } from "./components/tabs/define.js";

export function defineGlint(): void {
  defineButton();
  defineCard();
  defineInput();
  defineSelect();
  defineCheckbox();
  defineRadio();
  defineTooltip();
  defineAccordion();
  defineTabs();
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


