import { define } from "../../internal/define.js";

import { GlSearchInput } from "./search-input.js";

export function defineSearchInput(): void {
  define(GlSearchInput.tagName, GlSearchInput);
}

export { GlSearchInput };

