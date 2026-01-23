import { define } from "../../internal/define.js";
import { GlVirtualScroll } from "./virtual-scroll.js";

export function defineVirtualScroll(): void {
  define(GlVirtualScroll.tagName, GlVirtualScroll);
}

export { GlVirtualScroll };
