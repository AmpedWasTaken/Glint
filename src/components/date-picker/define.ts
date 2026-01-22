import { define } from "../../internal/define.js";

import { GlDatePicker } from "./date-picker.js";

export function defineDatePicker(): void {
  define(GlDatePicker.tagName, GlDatePicker);
}

export { GlDatePicker };

