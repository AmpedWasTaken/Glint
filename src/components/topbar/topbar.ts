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
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gl-space-4);
      padding: var(--gl-space-3) var(--gl-space-5);
      background: var(--gl-panel);
      border-bottom: 1px solid var(--gl-border);
      transition: background var(--gl-motion-dur) var(--gl-motion-ease),
        border-color var(--gl-motion-dur) var(--gl-motion-ease),
        box-shadow var(--gl-motion-dur) var(--gl-motion-ease),
        transform var(--gl-motion-dur) var(--gl-motion-ease);
    }
    :host([variant="glass"]) .topbar {
      background: var(--gl-glass-bg);
      border-color: var(--gl-glass-border);
      backdrop-filter: blur(var(--gl-glass-blur)) saturate(var(--gl-glass-saturation));
      -webkit-backdrop-filter: blur(var(--gl-glass-blur)) saturate(var(--gl-glass-saturation));
    }
    :host([variant="floating"]) {
      padding: var(--gl-space-2);
    }
    :host([variant="floating"]) .topbar {
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      box-shadow: var(--gl-shadow-md);
      margin: var(--gl-space-2);
      width: calc(100% - var(--gl-space-4));
    }
    :host([variant="minimal"]) .topbar {
      background: transparent;
      border: none;
      padding: var(--gl-space-2) 0;
    }
    :host([sticky]) {
      position: sticky;
      top: 0;
      z-index: 100;
    }
    :host([sticky]) .topbar {
      box-shadow: var(--gl-shadow-sm);
    }
    :host([sticky][variant="glass"]) .topbar {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .left {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
      flex: 0 0 auto;
    }
    .center {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
      flex: 1;
      justify-content: center;
    }
    .right {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
      flex: 0 0 auto;
    }
    ::slotted([slot="left"]) {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
    }
    ::slotted([slot="center"]) {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
    }
    ::slotted([slot="right"]) {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
    }
    @media (max-width: 768px) {
      .topbar {
        flex-wrap: wrap;
        padding: var(--gl-space-3);
      }
      .center {
        order: 3;
        width: 100%;
        margin-top: var(--gl-space-2);
        justify-content: flex-start;
      }
      :host([variant="floating"]) .topbar {
        margin: var(--gl-space-2);
      }
    }
  </style>
  <div class="topbar" part="topbar">
    <div part="left" class="left">
      <slot name="left"></slot>
    </div>
    <div part="center" class="center">
      <slot name="center"></slot>
    </div>
    <div part="right" class="right">
      <slot name="right"></slot>
    </div>
  </div>
`;

export class GlTopbar extends HTMLElement {
  static tagName = "gl-topbar";
  static get observedAttributes() {
    return ["variant", "sticky", "motion"];
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

