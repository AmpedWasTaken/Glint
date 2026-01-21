import { define } from "../../internal/define.js";
import { GlSkeleton } from "./skeleton.js";

export { GlSkeleton };
export function defineSkeleton() {
  define(GlSkeleton.tagName, GlSkeleton);
}

