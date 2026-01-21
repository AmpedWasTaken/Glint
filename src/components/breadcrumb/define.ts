import { define } from "../../internal/define.js";
import { GlBreadcrumb } from "./breadcrumb.js";
import { GlBreadcrumbItem } from "./item.js";

export { GlBreadcrumb, GlBreadcrumbItem };
export function defineBreadcrumb() {
  define(GlBreadcrumb.tagName, GlBreadcrumb);
  define(GlBreadcrumbItem.tagName, GlBreadcrumbItem);
}


