import { define } from "../../internal/define.js";
import { GlStatusIndicator } from "./status-indicator.js";

export function defineStatusIndicator(): void {
  define(GlStatusIndicator.tagName, GlStatusIndicator);
}

export { GlStatusIndicator };
