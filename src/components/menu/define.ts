import { define } from "../../internal/define.js";
import { GlMenu, GlMenuItem, GlMenuSeparator, GlMenuLabel } from "./menu.js";

export function defineMenu(): void {
  define(GlMenu.tagName, GlMenu);
  define(GlMenuItem.tagName, GlMenuItem);
  define(GlMenuSeparator.tagName, GlMenuSeparator);
  define(GlMenuLabel.tagName, GlMenuLabel);
}

export { GlMenu, GlMenuItem, GlMenuSeparator, GlMenuLabel };

