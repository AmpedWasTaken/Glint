import { define } from "../../internal/define.js";

import { GlRating } from "./rating.js";

export function defineRating(): void {
  define(GlRating.tagName, GlRating);
}

export { GlRating };

