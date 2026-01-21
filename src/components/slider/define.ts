import { define } from "../../internal/define.js";
import { GlSlider } from "./slider.js";

export { GlSlider };
export function defineSlider() {
  define(GlSlider.tagName, GlSlider);
}

