import { define } from "../../internal/define.js";

import { GlToast, GlToaster } from "./toast.js";

export function defineToast(): void {
  define(GlToast.tagName, GlToast);
  define(GlToaster.tagName, GlToaster);
}

export { GlToast, GlToaster };


