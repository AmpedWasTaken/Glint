import { define } from "../../internal/define.js";
import { GlList, GlListItem } from "./list.js";

export function defineList(): void {
  define(GlList.tagName, GlList);
  define(GlListItem.tagName, GlListItem);
}

export { GlList, GlListItem };

