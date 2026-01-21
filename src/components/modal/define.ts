import { define } from "../../internal/define.js";

import { GlModal } from "./modal.js";

export function defineModal(): void {
  define(GlModal.tagName, GlModal);
}

export { GlModal };


