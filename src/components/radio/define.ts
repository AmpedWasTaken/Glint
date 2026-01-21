import { define } from "../../internal/define.js";

import { GlRadio } from "./radio.js";

export function defineRadio(): void {
  define(GlRadio.tagName, GlRadio);
}

export { GlRadio };


