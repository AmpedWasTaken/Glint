import { define } from "../../internal/define.js";

import { GlProgress } from "./progress.js";

export function defineProgress() {
  define(GlProgress.tagName, GlProgress);
}

export { GlProgress };
