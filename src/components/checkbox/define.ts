import { define } from "../../internal/define.js";

import { GlCheckbox } from "./checkbox.js";

export function defineCheckbox(): void {
  define(GlCheckbox.tagName, GlCheckbox);
}

export { GlCheckbox };


