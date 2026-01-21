import { define } from "../../internal/define.js";

import { GlInput } from "./input.js";

export function defineInput(): void {
  define(GlInput.tagName, GlInput);
}

export { GlInput };


