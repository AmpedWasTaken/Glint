import { define } from "../../internal/define.js";
import { GlVideo } from "./video.js";

export function defineVideo(): void {
  define(GlVideo.tagName, GlVideo);
}

export { GlVideo };

