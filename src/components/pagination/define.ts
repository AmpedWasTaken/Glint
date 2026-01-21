import { define } from "../../internal/define.js";
import { GlPagination } from "./pagination.js";

export { GlPagination };
export function definePagination() {
  define(GlPagination.tagName, GlPagination);
}


