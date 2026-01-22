export class GlTable extends HTMLElement {
  static tagName = "gl-table";
  #observer?: MutationObserver;
  #isWrapping = false;

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
      `;
      document.head.appendChild(style);
    }
  }

  connectedCallback(): void {
    // Wrap content immediately and synchronously - this MUST happen before rendering
    this.#ensureTable();
    
    // Watch for dynamically added content
    if (!this.#observer) {
      this.#observer = new MutationObserver(() => {
        if (!this.#isWrapping) {
          this.#ensureTable();
        }
      });
      this.#observer.observe(this, { childList: true, subtree: false });
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
}
