import { GlNavbar } from "./navbar.js";

export { GlNavbar };

export function defineNavbar(): void {
  if (customElements.get(GlNavbar.tagName)) return;
  customElements.define(GlNavbar.tagName, GlNavbar);
}

