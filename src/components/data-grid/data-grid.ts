import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .data-grid {
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      background: var(--gl-panel);
      overflow: hidden;
    }
    .data-grid-header {
      padding: var(--gl-space-4);
      border-bottom: 1px solid var(--gl-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gl-space-4);
    }
    .data-grid-title {
      font-size: var(--gl-text-lg);
      font-weight: 600;
    }
    .data-grid-search {
      margin-left: auto;
    }
    .data-grid-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .data-grid-thead {
      background: var(--gl-hover);
    }
    .data-grid-header-row {
      display: table-row;
    }
    .data-grid-th {
      padding: var(--gl-space-3) var(--gl-space-4);
      text-align: left;
      font-size: var(--gl-text-sm);
      font-weight: 600;
      color: var(--gl-muted);
      border-bottom: 1px solid var(--gl-border);
      cursor: pointer;
      user-select: none;
      transition: background var(--gl-dur-1) var(--gl-ease);
    }
    .data-grid-th:hover {
      background: var(--gl-hover);
    }
    .data-grid-th.sortable {
      position: relative;
      padding-right: var(--gl-space-6);
    }
    .data-grid-th.sort-asc::after {
      content: "↑";
      position: absolute;
      right: var(--gl-space-2);
      color: var(--gl-primary);
    }
    .data-grid-th.sort-desc::after {
      content: "↓";
      position: absolute;
      right: var(--gl-space-2);
      color: var(--gl-primary);
    }
    .data-grid-tbody {
    }
    .data-grid-tr {
      border-bottom: 1px solid var(--gl-border);
      transition: background var(--gl-dur-1) var(--gl-ease);
    }
    .data-grid-tr:hover {
      background: var(--gl-hover);
    }
    .data-grid-tr.selected {
      background: var(--gl-primary);
      color: var(--gl-primary-fg);
    }
    .data-grid-td {
      padding: var(--gl-space-3) var(--gl-space-4);
      font-size: var(--gl-text-sm);
    }
    .data-grid-footer {
      padding: var(--gl-space-4);
      border-top: 1px solid var(--gl-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gl-space-4);
    }
    .data-grid-pagination {
      display: flex;
      gap: var(--gl-space-2);
      align-items: center;
    }
  </style>
  <div class="data-grid" part="grid">
    <div class="data-grid-header" part="header">
      <div class="data-grid-title" part="title">
        <slot name="title"></slot>
      </div>
      <div class="data-grid-search" part="search">
        <slot name="search"></slot>
      </div>
    </div>
    <table class="data-grid-table" part="table">
      <thead class="data-grid-thead" part="thead">
        <tr class="data-grid-header-row">
          <slot name="columns"></slot>
        </tr>
      </thead>
      <tbody class="data-grid-tbody" part="tbody">
        <slot name="rows"></slot>
      </tbody>
    </table>
    <div class="data-grid-footer" part="footer">
      <slot name="footer"></slot>
    </div>
  </div>
`;

const columnTemplate = document.createElement("template");
columnTemplate.innerHTML = `
  <style>
    :host {
      display: table-cell;
      vertical-align: middle;
      padding: var(--gl-space-3) var(--gl-space-4);
      text-align: left;
      font-size: var(--gl-text-sm);
      font-weight: 600;
      color: var(--gl-muted);
      border-bottom: 1px solid var(--gl-border);
      user-select: none;
      transition: background var(--gl-dur-1) var(--gl-ease);
      white-space: nowrap;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    :host(:hover) {
      background: var(--gl-hover);
    }
    :host([sortable]) {
      padding-right: var(--gl-space-6);
      cursor: pointer;
    }
    :host([sort="asc"])::after {
      content: "↑";
      position: absolute;
      right: var(--gl-space-2);
      color: var(--gl-primary);
    }
    :host([sort="desc"])::after {
      content: "↓";
      position: absolute;
      right: var(--gl-space-2);
      color: var(--gl-primary);
    }
  </style>
  <slot></slot>
`;

const rowTemplate = document.createElement("template");
rowTemplate.innerHTML = `
  <style>
    :host {
      display: table-row;
      border-bottom: 1px solid var(--gl-border);
      transition: background var(--gl-dur-1) var(--gl-ease);
    }
    :host(:hover) {
      background: var(--gl-hover);
    }
    :host([selected]) {
      background: var(--gl-primary);
      color: var(--gl-primary-fg);
    }
  </style>
  <slot></slot>
`;

const cellTemplate = document.createElement("template");
cellTemplate.innerHTML = `
  <style>
    :host {
      display: table-cell;
      vertical-align: middle;
      padding: var(--gl-space-3) var(--gl-space-4);
      font-size: var(--gl-text-sm);
      white-space: nowrap;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  </style>
  <slot></slot>
`;

export class GlDataGrid extends HTMLElement {
  static tagName = "gl-data-grid";
  static get observedAttributes() {
    return ["sortable", "selectable"];
  }

  #columns: GlDataGridColumn[] = [];
  #rows: GlDataGridRow[] = [];
  #currentSortColumn?: GlDataGridColumn;
  #currentSortDirection: "asc" | "desc" | null = null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    // Watch for slot changes
    const columnsSlot = this.shadowRoot!.querySelector('slot[name="columns"]') as HTMLSlotElement;
    const rowsSlot = this.shadowRoot!.querySelector('slot[name="rows"]') as HTMLSlotElement;
    
    if (columnsSlot) {
      columnsSlot.addEventListener("slotchange", () => {
        this.#updateColumnsAndRows();
      });
    }
    
    if (rowsSlot) {
      rowsSlot.addEventListener("slotchange", () => {
        this.#updateColumnsAndRows();
      });
    }
    
    // Initial update
    requestAnimationFrame(() => {
      this.#updateColumnsAndRows();
    });

    // Listen for sort events
    this.addEventListener("gl-data-grid-sort", this.#handleSort as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener("gl-data-grid-sort", this.#handleSort as EventListener);
  }

  #updateColumnsAndRows() {
    const columnsSlot = this.shadowRoot!.querySelector('slot[name="columns"]') as HTMLSlotElement;
    const rowsSlot = this.shadowRoot!.querySelector('slot[name="rows"]') as HTMLSlotElement;
    
    if (columnsSlot) {
      const assignedNodes = columnsSlot.assignedNodes();
      this.#columns = assignedNodes.filter(
        (node) => node instanceof GlDataGridColumn
      ) as GlDataGridColumn[];
      
      // Distribute columns evenly across the full width
      if (this.#columns.length > 0) {
        const columnWidth = `${100 / this.#columns.length}%`;
        this.#columns.forEach((col) => {
          col.style.width = columnWidth;
        });
      }
    }

    if (rowsSlot) {
      const assignedNodes = rowsSlot.assignedNodes();
      this.#rows = assignedNodes.filter(
        (node) => node instanceof GlDataGridRow
      ) as GlDataGridRow[];
    }
  }

  #handleSort = (e: CustomEvent) => {
    const column = e.detail.column as GlDataGridColumn;
    const direction = e.detail.direction as "asc" | "desc";
    
    if (!column || !direction) return;
    
    // Ensure columns are up to date
    this.#updateColumnsAndRows();
    
    // Reset other columns
    this.#columns.forEach((col) => {
      if (col !== column) {
        col.sort = null;
      }
    });
    
    this.#currentSortColumn = column;
    this.#currentSortDirection = direction;
    
    // Sort rows
    this.#sortRows(column, direction);
  };

  #sortRows(column: GlDataGridColumn, direction: "asc" | "desc") {
    const columnIndex = this.#columns.indexOf(column);
    if (columnIndex === -1) return;

    const rows = Array.from(this.#rows);
    
    rows.sort((a, b) => {
      const aCells = Array.from(a.querySelectorAll("gl-data-grid-cell"));
      const bCells = Array.from(b.querySelectorAll("gl-data-grid-cell"));
      
      const aValue = aCells[columnIndex]?.textContent?.trim() || "";
      const bValue = bCells[columnIndex]?.textContent?.trim() || "";
      
      // Try to parse as number for numeric sorting
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      
      let comparison: number;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        comparison = aNum - bNum;
      } else {
        comparison = aValue.localeCompare(bValue);
      }
      
      return direction === "asc" ? comparison : -comparison;
    });

    // Reorder rows in DOM by moving them within their parent
    const rowsSlot = this.shadowRoot!.querySelector('slot[name="rows"]') as HTMLSlotElement;
    if (!rowsSlot) return;
    
    // Get the tbody element
    const tbody = rowsSlot.closest('tbody');
    if (tbody) {
      rows.forEach((row) => {
        tbody.appendChild(row);
      });
    } else {
      // Fallback: append to component
      rows.forEach((row) => {
        if (row.parentNode) {
          row.parentNode.appendChild(row);
        }
      });
    }
  }
}

export class GlDataGridColumn extends HTMLElement {
  static tagName = "gl-data-grid-column";
  static get observedAttributes() {
    return ["sortable", "sort"];
  }

  #sortDirection: "asc" | "desc" | null = null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(columnTemplate.content.cloneNode(true));

    if (this.sortable) {
      this.setAttribute("sortable", "");
      this.addEventListener("click", () => this.toggleSort());
    }

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    this.classList.remove("sort-asc", "sort-desc");
    if (this.#sortDirection === "asc") {
      this.setAttribute("sort", "asc");
    } else if (this.#sortDirection === "desc") {
      this.setAttribute("sort", "desc");
    } else {
      this.removeAttribute("sort");
    }
  }

  get sortable() {
    return this.hasAttribute("sortable");
  }

  get sort() {
    return this.getAttribute("sort") as "asc" | "desc" | null;
  }

  set sort(v: "asc" | "desc" | null) {
    if (v) {
      this.setAttribute("sort", v);
      this.#sortDirection = v;
    } else {
      this.removeAttribute("sort");
      this.#sortDirection = null;
    }
    this.#sync();
  }

  toggleSort() {
    if (this.#sortDirection === null || this.#sortDirection === "desc") {
      this.sort = "asc";
    } else {
      this.sort = "desc";
    }
    emit(this, "gl-data-grid-sort", { 
      column: this,
      direction: this.#sortDirection 
    });
  }
}

export class GlDataGridRow extends HTMLElement {
  static tagName = "gl-data-grid-row";
  static get observedAttributes() {
    return ["selected"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(rowTemplate.content.cloneNode(true));

    this.addEventListener("click", () => {
      const grid = this.closest("gl-data-grid") as GlDataGrid;
      if (grid && grid.hasAttribute("selectable")) {
        this.toggle();
      }
    });

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    // Selected state is handled via attribute selector in CSS
  }

  get selected() {
    return this.hasAttribute("selected");
  }

  set selected(v: boolean) {
    if (v) this.setAttribute("selected", "");
    else this.removeAttribute("selected");
  }

  toggle() {
    this.selected = !this.selected;
    emit(this, "gl-data-grid-select", { selected: this.selected });
  }
}

export class GlDataGridCell extends HTMLElement {
  static tagName = "gl-data-grid-cell";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(cellTemplate.content.cloneNode(true));
  }
}

