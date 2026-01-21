import { GlTopbar } from "./topbar.js";

export { GlTopbar };

export function defineTopbar(): void {
  if (customElements.get(GlTopbar.tagName)) return;
  customElements.define(GlTopbar.tagName, GlTopbar);
}

