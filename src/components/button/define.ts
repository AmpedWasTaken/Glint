import { define } from "../../internal/define.js";

import { GlButton } from "./button.js";

export function defineButton(): void {
  define(GlButton.tagName, GlButton);
}

export { GlButton };
