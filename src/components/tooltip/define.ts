import { define } from "../../internal/define.js";

import { GlTooltip } from "./tooltip.js";

export function defineTooltip(): void {
  define(GlTooltip.tagName, GlTooltip);
}

export { GlTooltip };
