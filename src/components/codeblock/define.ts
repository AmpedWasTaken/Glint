import { define } from "../../internal/define.js";
import { GlCodeblock } from "./codeblock.js";

export function defineCodeblock(): void {
  define(GlCodeblock.tagName, GlCodeblock);
}

export { GlCodeblock };

