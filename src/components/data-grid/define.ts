import { define } from "../../internal/define.js";
import { GlDataGrid, GlDataGridColumn, GlDataGridRow, GlDataGridCell } from "./data-grid.js";

export function defineDataGrid(): void {
  define(GlDataGrid.tagName, GlDataGrid);
  define(GlDataGridColumn.tagName, GlDataGridColumn);
  define(GlDataGridRow.tagName, GlDataGridRow);
  define(GlDataGridCell.tagName, GlDataGridCell);
}

export { GlDataGrid, GlDataGridColumn, GlDataGridRow, GlDataGridCell };

