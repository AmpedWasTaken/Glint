import { define } from "../../internal/define.js";
import { GlBanner } from "./banner.js";

export function defineBanner(): void {
  define(GlBanner.tagName, GlBanner);
}

export { GlBanner };
