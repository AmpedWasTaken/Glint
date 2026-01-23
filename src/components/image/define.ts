import { define } from "../../internal/define.js";
import { GlImage } from "./image.js";

export function defineImage(): void {
  define(GlImage.tagName, GlImage);
}

export { GlImage };

