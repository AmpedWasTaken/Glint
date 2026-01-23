import { define } from "../../internal/define.js";
import { GlChart } from "./chart.js";

export function defineChart(): void {
  define(GlChart.tagName, GlChart);
}

export { GlChart };

