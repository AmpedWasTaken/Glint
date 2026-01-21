import { define } from "../../internal/define.js";
import { GlPopover } from "./popover.js";

export { GlPopover };
export function definePopover() {
  define(GlPopover.tagName, GlPopover);
}


