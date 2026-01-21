import { define } from "../../internal/define.js";
import { GlDropdown } from "./dropdown.js";

export { GlDropdown };
export function defineDropdown() {
  define(GlDropdown.tagName, GlDropdown);
}

