export class GlLink extends HTMLElement {
  static tagName = "gl-link";

  connectedCallback(): void {
    if (this.shadowRoot) return;

    const href = this.getAttribute("href") || "#";
    const target = this.getAttribute("target") || "";
    const variant = this.getAttribute("variant") || "default";

    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          display: inline;
        }
        a {
          color: var(--gl-primary);
          text-decoration: none;
          transition: color var(--gl-dur-1) var(--gl-ease), text-decoration var(--gl-dur-1) var(--gl-ease);
        }
        a:hover {
          color: var(--gl-primary-hover);
          text-decoration: underline;
        }
        a:focus-visible {
          outline: 2px solid var(--gl-ring);
          outline-offset: 2px;
          border-radius: 4px;
        }
        :host([variant="muted"]) a {
          color: var(--gl-muted);
        }
        :host([variant="muted"]) a:hover {
          color: var(--gl-fg);
        }
        :host([variant="destructive"]) a {
          color: var(--gl-destructive);
        }
        :host([variant="destructive"]) a:hover {
          color: var(--gl-destructive-hover);
        }
        :host([variant="ghost"]) a {
          color: var(--gl-fg);
        }
        :host([variant="ghost"]) a:hover {
          background: var(--gl-hover);
          text-decoration: none;
        }
      </style>
      <a part="link" href="${href}" ${target ? `target="${target}"` : ""}>
        <slot></slot>
      </a>
    `;

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes(): string[] {
    return ["href", "target"];
  }

  attributeChangedCallback(name: string, _old: string, newVal: string): void {
    if (!this.shadowRoot) return;
    const link = this.shadowRoot.querySelector("a");
    if (!link) return;
    if (name === "href") {
      link.setAttribute("href", newVal || "#");
    } else if (name === "target") {
      if (newVal) {
        link.setAttribute("target", newVal);
      } else {
        link.removeAttribute("target");
      }
    }
  }
}

