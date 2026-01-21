import { define } from "../../internal/define.js";

import { GlAlert } from "./alert.js";

export function defineAlert() {
  define(GlAlert.tagName, GlAlert);
}

export { GlAlert };
