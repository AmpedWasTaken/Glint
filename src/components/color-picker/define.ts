import { define } from "../../internal/define.js";

import { GlColorPicker } from "./color-picker.js";

export function defineColorPicker(): void {
  define(GlColorPicker.tagName, GlColorPicker);
}

export { GlColorPicker };

