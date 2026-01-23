import { define } from "../../internal/define.js";
import { GlResizable } from "./resizable.js";

export function defineResizable(): void {
  define(GlResizable.tagName, GlResizable);
}

export { GlResizable };
