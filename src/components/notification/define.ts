import { define } from "../../internal/define.js";
import { GlNotification } from "./notification.js";

export function defineNotification(): void {
  define(GlNotification.tagName, GlNotification);
}

export { GlNotification };
