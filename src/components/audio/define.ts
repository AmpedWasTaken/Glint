import { define } from "../../internal/define.js";
import { GlAudio } from "./audio.js";

export function defineAudio(): void {
  define(GlAudio.tagName, GlAudio);
}

export { GlAudio };

