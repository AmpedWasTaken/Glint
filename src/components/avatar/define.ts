import { define } from "../../internal/define.js";
import { GlAvatar } from "./avatar.js";

export { GlAvatar };
export function defineAvatar() {
  define(GlAvatar.tagName, GlAvatar);
}

