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
      flex: 1;
      max-width: 300px;
    }
    .data-grid-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-grid-thead {
      background: var(--gl-hover);
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
        <slot name="columns"></slot>
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
  </style>
  <th class="data-grid-th" part="th">
    <slot></slot>
  </th>
`;

const rowTemplate = document.createElement("template");
rowTemplate.innerHTML = `
  <style>
    :host {
      display: table-row;
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
  </style>
  <tr class="data-grid-tr" part="tr">
    <slot></slot>
  </tr>
`;

const cellTemplate = document.createElement("template");
cellTemplate.innerHTML = `
  <style>
    :host {
      display: table-cell;
    }
    .data-grid-td {
      padding: var(--gl-space-3) var(--gl-space-4);
      font-size: var(--gl-text-sm);
    }
  </style>
  <td class="data-grid-td" part="td">
    <slot></slot>
  </td>
`;

export class GlDataGrid extends HTMLElement {
  static tagName = "gl-data-grid";
  static get observedAttributes() {
    return ["sortable", "selectable"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }
}

export class GlDataGridColumn extends HTMLElement {
  static tagName = "gl-data-grid-column";
  static get observedAttributes() {
    return ["sortable", "sort"];
  }

  #th!: HTMLElement;
  #sortDirection: "asc" | "desc" | null = null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(columnTemplate.content.cloneNode(true));
    
    this.#th = this.shadowRoot!.querySelector(".data-grid-th") as HTMLElement;

    if (this.sortable) {
      this.#th.classList.add("sortable");
      this.#th.addEventListener("click", () => this.toggleSort());
    }

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (this.#th) {
      this.#th.classList.remove("sort-asc", "sort-desc");
      if (this.#sortDirection === "asc") {
        this.#th.classList.add("sort-asc");
      } else if (this.#sortDirection === "desc") {
        this.#th.classList.add("sort-desc");
      }
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
      column: this.textContent || "",
      direction: this.#sortDirection 
    });
  }
}

export class GlDataGridRow extends HTMLElement {
  static tagName = "gl-data-grid-row";
  static get observedAttributes() {
    return ["selected"];
  }

  #tr!: HTMLElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(rowTemplate.content.cloneNode(true));
    
    this.#tr = this.shadowRoot!.querySelector(".data-grid-tr") as HTMLElement;

    this.#tr.addEventListener("click", () => {
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
    if (this.#tr) {
      if (this.selected) {
        this.#tr.classList.add("selected");
      } else {
        this.#tr.classList.remove("selected");
      }
    }
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

