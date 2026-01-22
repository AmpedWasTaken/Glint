import { define } from "../../internal/define.js";
import { GlCommandPalette, GlCommandItem, GlCommandGroup } from "./command-palette.js";

export function defineCommandPalette(): void {
  define(GlCommandPalette.tagName, GlCommandPalette);
  define(GlCommandItem.tagName, GlCommandItem);
  define(GlCommandGroup.tagName, GlCommandGroup);
}

export { GlCommandPalette, GlCommandItem, GlCommandGroup };

