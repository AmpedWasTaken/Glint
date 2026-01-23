import { define } from "../../internal/define.js";
import { GlStatCard } from "./stat-card.js";

export function defineStatCard(): void {
  define(GlStatCard.tagName, GlStatCard);
}

export { GlStatCard };
