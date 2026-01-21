import "./styles/glint.css";

import { defineButton } from "./components/button/define.js";

export { defineButton, GlButton } from "./components/button/define.js";

export function defineGlint(): void {
  defineButton();
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


