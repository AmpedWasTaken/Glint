import { define } from "../../internal/define.js";

import { GlCard } from "./card.js";

export function defineCard(): void {
  define(GlCard.tagName, GlCard);
}

export { GlCard };
