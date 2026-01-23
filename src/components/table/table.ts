import { emit } from "../../internal/events.js";

export class GlTable extends HTMLElement {
  static tagName = "gl-table";
  static get observedAttributes() {
    return ["selectable", "sortable", "filterable", "page-size"];
  }
  
  #observer?: MutationObserver;
  #isWrapping = false;
  #table?: HTMLTableElement;
  #sortColumn?: string;
  #sortDirection: "asc" | "desc" = "asc";
  #filterText = "";
  #currentPage = 1;
  #pageSize = 0;

  constructor() {
    super();
    // Inject global styles immediately in constructor
    if (!document.getElementById("gl-table-styles")) {
      const style = document.createElement("style");
      style.id = "gl-table-styles";
      style.textContent = `
        gl-table {
          display: block;
          width: 100%;
        }
        gl-table > table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--gl-text-md);
          line-height: var(--gl-line-md);
        }
        gl-table th,
        gl-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--gl-border);
        }
        gl-table th {
          font-weight: 600;
          color: var(--gl-fg);
          background: var(--gl-panel);
        }
        gl-table td {
          color: var(--gl-muted);
        }
        gl-table tbody tr:last-child td {
          border-bottom: none;
        }
        gl-table[variant="bordered"] > table {
          border: 1px solid var(--gl-border);
        }
        gl-table[variant="striped"] tbody tr:nth-child(even) {
          background: var(--gl-panel);
        }
        gl-table[variant="hover"] tbody tr:hover {
          background: var(--gl-hover);
        }
        gl-table[motion="subtle"] tbody tr {
          transition: background var(--gl-dur-2) var(--gl-ease-out);
        }
        gl-table[motion="snappy"] tbody tr {
          transition: background var(--gl-dur-1) var(--gl-ease-out);
        }
        gl-table[selectable] tbody tr{cursor:pointer}
        gl-table[selectable] tbody tr[data-selected]{background:color-mix(in srgb, var(--gl-primary) 15%, transparent)}
        gl-table th[data-sortable]{cursor:pointer;user-select:none;position:relative;padding-right:24px}
        gl-table th[data-sortable]:hover{background:var(--gl-hover)}
        gl-table th[data-sortable]::after{
          content:"⇅";
          position:absolute;
          right:8px;
          opacity:0.3;
        }
        gl-table th[data-sort="asc"]::after{content:"↑";opacity:1}
        gl-table th[data-sort="desc"]::after{content:"↓";opacity:1}
        .table-filter{
          padding:8px 12px;
          margin-bottom:8px;
          border:1px solid var(--gl-border);
          border-radius:6px;
          background:var(--gl-panel);
          font-size:14px;
        }
        .table-pagination{
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-top:16px;
          gap:8px;
        }
        .table-pagination-info{color:var(--gl-muted);font-size:14px}
        .table-pagination-controls{
          display:flex;
          gap:4px;
        }
        .table-pagination-btn{
          all:unset;
          padding:6px 12px;
          border:1px solid var(--gl-border);
          border-radius:6px;
          cursor:pointer;
          font-size:14px;
          transition:background var(--gl-dur-1) var(--gl-ease);
        }
        .table-pagination-btn:hover{background:var(--gl-hover)}
        .table-pagination-btn:disabled{opacity:0.5;cursor:not-allowed}
      `;
      document.head.appendChild(style);
    }
  }

  connectedCallback(): void {
    // Wrap content immediately and synchronously - this MUST happen before rendering
    this.#ensureTable();
    
    this.#table = this.querySelector("table");
    if (this.#table) {
      this.#setupFeatures();
    }
    
    // Watch for dynamically added content
    if (!this.#observer) {
      this.#observer = new MutationObserver(() => {
        if (!this.#isWrapping) {
          this.#ensureTable();
          if (!this.#table) {
            this.#table = this.querySelector("table");
            if (this.#table) this.#setupFeatures();
          }
        }
      });
      this.#observer.observe(this, { childList: true, subtree: true });
    }
  }

  disconnectedCallback(): void {
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = undefined;
    }
  }

  #ensureTable(): void {
    // Prevent infinite loops
    if (this.#isWrapping) return;
    
    // Check if table already exists as direct child
    const existingTable = this.querySelector(":scope > table") as HTMLTableElement | null;
    
    if (!existingTable) {
      // No table exists - we need to create one and move content
      const children = Array.from(this.childNodes);
      
      // Filter out only element nodes (ignore text nodes with just whitespace)
      const elements = children.filter(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          return true;
        }
        if (child.nodeType === Node.TEXT_NODE) {
          // Only keep text nodes that have non-whitespace content
          return (child.textContent?.trim().length ?? 0) > 0;
        }
        return false;
      });
      
      // If we have any elements, wrap them in a table
      if (elements.length > 0) {
        this.#isWrapping = true;
        
        const newTable = document.createElement("table");
        
        // Move all elements into the table
        elements.forEach(child => {
          newTable.appendChild(child);
        });
        
        // Append the table to the component
        this.appendChild(newTable);
        
        this.#isWrapping = false;
      }
    }
  }

  #setupFeatures() {
    if (!this.#table) return;
    
    // Setup selection
    if (this.hasAttribute("selectable")) {
      const rows = this.#table.querySelectorAll("tbody tr");
      rows.forEach(row => {
        row.addEventListener("click", () => {
          const mode = this.getAttribute("selectable") || "single";
          if (mode === "single") {
            rows.forEach(r => r.removeAttribute("data-selected"));
            row.setAttribute("data-selected", "");
          } else {
            row.toggleAttribute("data-selected");
          }
          const selected = Array.from(rows).filter(r => r.hasAttribute("data-selected"));
          emit(this, "gl-select", { rows: selected });
        });
      });
    }

    // Setup sorting
    if (this.hasAttribute("sortable")) {
      const headers = this.#table.querySelectorAll("thead th");
      headers.forEach((header, index) => {
        header.setAttribute("data-sortable", "");
        header.addEventListener("click", () => {
          const column = header.textContent?.trim() || String(index);
          this.#sort(column);
        });
      });
    }

    // Setup filtering
    if (this.hasAttribute("filterable")) {
      const filter = document.createElement("input");
      filter.className = "table-filter";
      filter.type = "text";
      filter.placeholder = "Filter rows...";
      filter.addEventListener("input", (e) => {
        this.#filterText = (e.target as HTMLInputElement).value.toLowerCase();
        this.#applyFilter();
      });
      this.insertBefore(filter, this.#table);
    }

    // Setup pagination
    const pageSize = this.getAttribute("page-size");
    if (pageSize) {
      this.#pageSize = Number(pageSize) || 0;
      this.#setupPagination();
    }
  }

  #sort(column: string) {
    if (!this.#table) return;
    if (this.#sortColumn === column) {
      this.#sortDirection = this.#sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.#sortColumn = column;
      this.#sortDirection = "asc";
    }

    const tbody = this.#table.querySelector("tbody");
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    const headerIndex = Array.from(this.#table.querySelectorAll("thead th")).findIndex(
      h => h.textContent?.trim() === column
    );

    if (headerIndex === -1) return;

    rows.sort((a, b) => {
      const aText = a.cells[headerIndex]?.textContent?.trim() || "";
      const bText = b.cells[headerIndex]?.textContent?.trim() || "";
      const aNum = Number(aText);
      const bNum = Number(bText);
      
      let comparison = 0;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        comparison = aNum - bNum;
      } else {
        comparison = aText.localeCompare(bText);
      }
      
      return this.#sortDirection === "asc" ? comparison : -comparison;
    });

    rows.forEach(row => tbody.appendChild(row));

    // Update header indicators
    const headers = this.#table.querySelectorAll("thead th");
    headers.forEach((h, i) => {
      h.removeAttribute("data-sort");
      if (h.textContent?.trim() === column) {
        h.setAttribute("data-sort", this.#sortDirection);
      }
    });

    emit(this, "gl-sort", { column, direction: this.#sortDirection });
  }

  #applyFilter() {
    if (!this.#table) return;
    const rows = this.#table.querySelectorAll("tbody tr");
    rows.forEach(row => {
      const text = row.textContent?.toLowerCase() || "";
      row.style.display = text.includes(this.#filterText) ? "" : "none";
    });
  }

  #setupPagination() {
    if (!this.#table || this.#pageSize <= 0) return;
    
    const pagination = document.createElement("div");
    pagination.className = "table-pagination";
    
    const info = document.createElement("div");
    info.className = "table-pagination-info";
    pagination.appendChild(info);
    
    const controls = document.createElement("div");
    controls.className = "table-pagination-controls";
    
    const prev = document.createElement("button");
    prev.className = "table-pagination-btn";
    prev.textContent = "Previous";
    prev.addEventListener("click", () => {
      if (this.#currentPage > 1) {
        this.#currentPage--;
        this.#paginate();
      }
    });
    
    const next = document.createElement("button");
    next.className = "table-pagination-btn";
    next.textContent = "Next";
    next.addEventListener("click", () => {
      const totalPages = this.#getTotalPages();
      if (this.#currentPage < totalPages) {
        this.#currentPage++;
        this.#paginate();
      }
    });
    
    controls.appendChild(prev);
    controls.appendChild(next);
    pagination.appendChild(controls);
    
    this.appendChild(pagination);
    this.#paginate();
  }

  #paginate() {
    if (!this.#table || this.#pageSize <= 0) return;
    const rows = Array.from(this.#table.querySelectorAll("tbody tr"));
    const start = (this.#currentPage - 1) * this.#pageSize;
    const end = start + this.#pageSize;
    
    rows.forEach((row, index) => {
      row.style.display = index >= start && index < end ? "" : "none";
    });
    
    const info = this.querySelector(".table-pagination-info");
    if (info) {
      const total = rows.length;
      info.textContent = `Showing ${start + 1}-${Math.min(end, total)} of ${total}`;
    }
    
    const prev = this.querySelector(".table-pagination-btn") as HTMLButtonElement;
    const next = this.querySelectorAll(".table-pagination-btn")[1] as HTMLButtonElement;
    if (prev) prev.disabled = this.#currentPage === 1;
    if (next) next.disabled = this.#currentPage >= this.#getTotalPages();
  }

  #getTotalPages(): number {
    if (!this.#table || this.#pageSize <= 0) return 1;
    const rows = this.#table.querySelectorAll("tbody tr");
    return Math.ceil(rows.length / this.#pageSize);
  }

  attributeChangedCallback() {
    if (this.#table) {
      this.#setupFeatures();
    }
  }
}
