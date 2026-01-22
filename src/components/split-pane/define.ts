import { define } from "../../internal/define.js";
import { GlSplitPane } from "./split-pane.js";

export function defineSplitPane(): void {
  define(GlSplitPane.tagName, GlSplitPane);
}

export { GlSplitPane };

