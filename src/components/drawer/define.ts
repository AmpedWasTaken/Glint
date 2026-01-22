import { define } from "../../internal/define.js";
import { GlDrawer } from "./drawer.js";

export function defineDrawer(): void {
  define(GlDrawer.tagName, GlDrawer);
}

export { GlDrawer };

