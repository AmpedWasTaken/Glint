import { define } from "../../internal/define.js";
import { GlCalendar } from "./calendar.js";

export function defineCalendar(): void {
  define(GlCalendar.tagName, GlCalendar);
}

export { GlCalendar };

