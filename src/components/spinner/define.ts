import { define } from "../../internal/define.js";

import { GlSpinner } from "./spinner.js";

export function defineSpinner() {
  define(GlSpinner.tagName, GlSpinner);
}

export { GlSpinner };
