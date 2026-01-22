import { define } from "../../internal/define.js";
import { GlContainer } from "./container.js";

export function defineContainer(): void {
  define(GlContainer.tagName, GlContainer);
}

export { GlContainer };

