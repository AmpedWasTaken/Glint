import { define } from "../../internal/define.js";
import { GlInfiniteScroll } from "./infinite-scroll.js";

export function defineInfiniteScroll(): void {
  define(GlInfiniteScroll.tagName, GlInfiniteScroll);
}

export { GlInfiniteScroll };
