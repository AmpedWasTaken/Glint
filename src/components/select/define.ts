import { define } from "../../internal/define.js";

import { GlSelect } from "./select.js";

export function defineSelect(): void {
  define(GlSelect.tagName, GlSelect);
}

export { GlSelect };
