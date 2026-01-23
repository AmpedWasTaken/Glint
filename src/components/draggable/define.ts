import { define } from "../../internal/define.js";
import { GlDraggable } from "./draggable.js";

export function defineDraggable(): void {
  define(GlDraggable.tagName, GlDraggable);
}

export { GlDraggable };
