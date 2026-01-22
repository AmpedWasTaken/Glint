import { define } from "../../internal/define.js";

import { GlTimePicker } from "./time-picker.js";

export function defineTimePicker(): void {
  define(GlTimePicker.tagName, GlTimePicker);
}

export { GlTimePicker };

