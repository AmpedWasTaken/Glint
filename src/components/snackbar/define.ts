import { define } from "../../internal/define.js";
import { GlSnackbar } from "./snackbar.js";

export function defineSnackbar(): void {
  define(GlSnackbar.tagName, GlSnackbar);
}

export { GlSnackbar };
