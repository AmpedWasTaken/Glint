import { define } from "../../internal/define.js";

import { GlAccordion, GlAccordionItem } from "./accordion.js";

export function defineAccordion(): void {
  define(GlAccordion.tagName, GlAccordion);
  define(GlAccordionItem.tagName, GlAccordionItem);
}

export { GlAccordion, GlAccordionItem };


