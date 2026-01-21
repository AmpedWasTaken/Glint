const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
    }
    :host {
      --gl-motion-dur: var(--gl-dur-2);
      --gl-motion-ease: var(--gl-ease-out);
    }
    :host([motion="none"]) {
      --gl-motion-dur: 0ms;
    }
    :host([motion="subtle"]) {
      --gl-motion-dur: var(--gl-dur-2);
      --gl-motion-ease: var(--gl-ease-out);
    }
    :host([motion="snappy"]) {
      --gl-motion-dur: var(--gl-dur-1);
      --gl-motion-ease: var(--gl-ease-spring);
    }
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gl-space-4);
      padding: var(--gl-space-3) var(--gl-space-5);
      background: var(--gl-panel);
      border-bottom: 1px solid var(--gl-border);
      transition: background var(--gl-motion-dur) var(--gl-motion-ease),
        border-color var(--gl-motion-dur) var(--gl-motion-ease),
        box-shadow var(--gl-motion-dur) var(--gl-motion-ease);
    }
    :host([variant="glass"]) .navbar {
      background: var(--gl-glass-bg);
      border-color: var(--gl-glass-border);
      backdrop-filter: blur(var(--gl-glass-blur)) saturate(var(--gl-glass-saturation));
      -webkit-backdrop-filter: blur(var(--gl-glass-blur)) saturate(var(--gl-glass-saturation));
    }
    :host([variant="bordered"]) .navbar {
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      margin: var(--gl-space-2);
      width: calc(100% - var(--gl-space-4));
    }
    :host([variant="minimal"]) .navbar {
      background: transparent;
      border: none;
      padding: var(--gl-space-2) 0;
    }
    :host([sticky]) {
      position: sticky;
      top: 0;
      z-index: 100;
    }
    :host([sticky]) .navbar {
      box-shadow: var(--gl-shadow-sm);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
      text-decoration: none;
      color: inherit;
      font-weight: 600;
      font-size: var(--gl-text-lg);
    }
    .brand:hover {
      opacity: 0.8;
    }
    .nav {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
      flex: 1;
      justify-content: flex-start;
      margin-left: var(--gl-space-5);
    }
    :host([align="center"]) .nav {
      justify-content: center;
      margin-left: 0;
    }
    :host([align="end"]) .nav {
      justify-content: flex-end;
      margin-left: 0;
      margin-right: var(--gl-space-5);
    }
    .actions {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
    }
    ::slotted([slot="brand"]) {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
    }
    ::slotted([slot="nav"]) {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
    }
    ::slotted([slot="actions"]) {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
    }
    @media (max-width: 768px) {
      .navbar {
        flex-wrap: wrap;
        padding: var(--gl-space-3);
      }
      .nav {
        order: 3;
        width: 100%;
        margin-left: 0;
        margin-top: var(--gl-space-2);
        justify-content: flex-start;
      }
      :host([align="center"]) .nav,
      :host([align="end"]) .nav {
        margin-right: 0;
      }
    }
  </style>
  <nav class="navbar" part="navbar" role="navigation">
    <div part="brand" class="brand">
      <slot name="brand"></slot>
    </div>
    <div part="nav" class="nav">
      <slot name="nav"></slot>
    </div>
    <div part="actions" class="actions">
      <slot name="actions"></slot>
    </div>
  </nav>
`;

export class GlNavbar extends HTMLElement {
  static tagName = "gl-navbar";
  static get observedAttributes() {
    return ["variant", "sticky", "align", "motion"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) {
      root.appendChild(template.content.cloneNode(true));
    }
  }

  attributeChangedCallback() {
    // Sync attributes if needed
  }
}

