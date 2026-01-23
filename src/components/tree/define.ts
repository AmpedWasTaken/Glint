import { define } from "../../internal/define.js";
import { GlTree, GlTreeItem } from "./tree.js";

export function defineTree(): void {
  define(GlTree.tagName, GlTree);
  define(GlTreeItem.tagName, GlTreeItem);
}

export { GlTree, GlTreeItem };

