import { define } from "../../internal/define.js";
import { GlEmptyState } from "./empty-state.js";

export function defineEmptyState(): void {
  define(GlEmptyState.tagName, GlEmptyState);
}

export { GlEmptyState };

