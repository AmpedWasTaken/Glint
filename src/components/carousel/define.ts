import { define } from "../../internal/define.js";
import { GlCarousel, GlCarouselItem } from "./carousel.js";

export function defineCarousel(): void {
  define(GlCarousel.tagName, GlCarousel);
  define(GlCarouselItem.tagName, GlCarouselItem);
}

export { GlCarousel, GlCarouselItem };

