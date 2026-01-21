import { define } from "../../internal/define.js";

import { GlBadge } from "./badge.js";

export function defineBadge() {
  define(GlBadge.tagName, GlBadge);
}

export { GlBadge };
