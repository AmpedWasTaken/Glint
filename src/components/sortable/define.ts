import { define } from "../../internal/define.js";
import { GlSortable } from "./sortable.js";

export function defineSortable(): void {
  define(GlSortable.tagName, GlSortable);
}

export { GlSortable };
