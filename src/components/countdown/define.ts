import { define } from "../../internal/define.js";
import { GlCountdown } from "./countdown.js";

export function defineCountdown(): void {
  define(GlCountdown.tagName, GlCountdown);
}

export { GlCountdown };
