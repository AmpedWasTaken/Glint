import { define } from "../../internal/define.js";
import { GlTextarea } from "./textarea.js";

export { GlTextarea };
export function defineTextarea() {
  define(GlTextarea.tagName, GlTextarea);
}


