export class GlTable extends HTMLElement {
  static tagName = "gl-table";

  connectedCallback(): void {
    if (this.shadowRoot) return;

    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--gl-text-md);
          line-height: var(--gl-line-md);
        }
        :host([variant="bordered"]) table {
          border: 1px solid var(--gl-border);
        }
        :host([variant="striped"]) tbody tr:nth-child(even) {
          background: var(--gl-panel);
        }
        :host([variant="hover"]) tbody tr:hover {
          background: var(--gl-hover);
        }
        :host([motion="subtle"]) tbody tr {
          transition: background var(--gl-dur-2) var(--gl-ease-out);
        }
        :host([motion="snappy"]) tbody tr {
          transition: background var(--gl-dur-1) var(--gl-ease-out);
        }
      </style>
      <table part="table">
        <slot></slot>
      </table>
    `;

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }
}

