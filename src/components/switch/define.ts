import { define } from "../../internal/define.js";
import { GlSwitch } from "./switch.js";

export { GlSwitch };
export function defineSwitch() {
  define(GlSwitch.tagName, GlSwitch);
}

