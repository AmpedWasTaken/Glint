import "./styles/glint.css";

import { defineButton } from "./components/button/define.js";
import { defineCard } from "./components/card/define.js";

export { defineButton, GlButton } from "./components/button/define.js";
export { defineCard, GlCard } from "./components/card/define.js";

export function defineGlint(): void {
  defineButton();
  defineCard();
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


