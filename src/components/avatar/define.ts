import { define } from "../../internal/define.js";
import { GlAvatar } from "./avatar.js";
import { GlAvatarGroup } from "./avatar-group.js";

export { GlAvatar, GlAvatarGroup };
export function defineAvatar() {
  define(GlAvatar.tagName, GlAvatar);
  define(GlAvatarGroup.tagName, GlAvatarGroup);
}

