import { define } from "../../internal/define.js";

import { GlSidebar } from "./sidebar.js";

export function defineSidebar(): void {
  define(GlSidebar.tagName, GlSidebar);
}

export { GlSidebar };
