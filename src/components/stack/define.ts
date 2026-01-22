import { define } from "../../internal/define.js";
import { GlStack } from "./stack.js";

export function defineStack(): void {
  define(GlStack.tagName, GlStack);
}

export { GlStack };

