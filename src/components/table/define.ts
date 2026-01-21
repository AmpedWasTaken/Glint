import { define } from "../../internal/define.js";
import { GlTable } from "./table.js";

export function defineTable(): void {
  define(GlTable.tagName, GlTable);
}

export { GlTable };

