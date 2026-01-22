import { define } from "../../internal/define.js";

import { GlForm } from "./form.js";

export function defineForm(): void {
  define(GlForm.tagName, GlForm);
}

export { GlForm };

