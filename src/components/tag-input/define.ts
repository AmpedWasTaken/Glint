import { define } from "../../internal/define.js";

import { GlTagInput } from "./tag-input.js";

export function defineTagInput(): void {
  define(GlTagInput.tagName, GlTagInput);
}

export { GlTagInput };

