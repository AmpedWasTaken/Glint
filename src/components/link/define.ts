import { define } from "../../internal/define.js";
import { GlLink } from "./link.js";

export function defineLink(): void {
  define(GlLink.tagName, GlLink);
}

export { GlLink };

