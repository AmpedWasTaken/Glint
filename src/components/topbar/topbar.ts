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
      border-radius: var(--gl-radius);
      transition: background var(--gl-motion-dur) var(--gl-motion-ease),
        border-color var(--gl-motion-dur) var(--gl-motion-ease),
        box-shadow var(--gl-motion-dur) var(--gl-motion-ease),
        transform var(--gl-motion-dur) var(--gl-motion-ease);
    }
    :host([variant="glass"]) .topbar {
      background: var(--gl-glass-bg);
      border-color: var(--gl-glass-border);
      border-radius: var(--gl-radius);
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
    .mobile-menu-btn{
      display:none;
      all:unset;
      cursor:pointer;
      padding:8px;
      border-radius:6px;
      color:var(--gl-fg);
      transition:background var(--gl-dur-1) var(--gl-ease);
    }
    .mobile-menu-btn:hover{background:var(--gl-hover)}
    .mobile-menu-btn svg{width:24px;height:24px}
    .mobile-menu{
      display:none;
      position:absolute;
      top:100%;
      left:0;
      right:0;
      background:var(--gl-panel);
      border-top:1px solid var(--gl-border);
      box-shadow:var(--gl-shadow-lg);
      padding:var(--gl-space-3);
      flex-direction:column;
      gap:var(--gl-space-2);
      max-height:0;
      overflow:hidden;
      transition:max-height var(--gl-dur-2) var(--gl-ease-out), padding var(--gl-dur-2) var(--gl-ease-out);
    }
    .mobile-menu.open{
      max-height:500px;
    }
    :host([mobile-menu]) .mobile-menu-btn{display:flex}
    :host([mobile-menu]) .center{display:none}
    @media (max-width: 768px) {
      .topbar {
        flex-wrap: wrap;
        padding: var(--gl-space-3);
        position:relative;
      }
      :host(:not([mobile-menu])) .center {
        order: 3;
        width: 100%;
        margin-top: var(--gl-space-2);
        justify-content: flex-start;
      }
      :host([variant="floating"]) .topbar {
        margin: var(--gl-space-2);
      }
      :host([mobile-menu]) .mobile-menu-btn{display:flex}
      :host([mobile-menu]) .center{display:none}
    }
  </style>
  <div class="topbar" part="topbar">
    <div part="left" class="left">
      <slot name="left"></slot>
    </div>
    <button class="mobile-menu-btn" part="mobile-menu-btn" aria-label="Toggle menu" aria-expanded="false" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    </button>
    <div part="center" class="center">
      <slot name="center"></slot>
    </div>
    <div part="right" class="right">
      <slot name="right"></slot>
    </div>
    <div class="mobile-menu" part="mobile-menu">
      <slot name="center"></slot>
    </div>
  </div>
`;

export class GlTopbar extends HTMLElement {
  static tagName = "gl-topbar";
  static get observedAttributes() {
    return ["variant", "sticky", "motion", "mobile-menu"];
  }

  #mobileMenuBtn!: HTMLButtonElement;
  #mobileMenu!: HTMLElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) {
      root.appendChild(template.content.cloneNode(true));
    }
    
    this.#mobileMenuBtn = root.querySelector(".mobile-menu-btn") as HTMLButtonElement;
    this.#mobileMenu = root.querySelector(".mobile-menu") as HTMLElement;
    
    if (this.#mobileMenuBtn) {
      this.#mobileMenuBtn.addEventListener("click", () => this.toggleMobileMenu());
    }
    
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  toggleMobileMenu() {
    this.toggleAttribute("mobile-menu-open");
  }

  #sync() {
    const isOpen = this.hasAttribute("mobile-menu-open");
    if (this.#mobileMenu) {
      this.#mobileMenu.classList.toggle("open", isOpen);
    }
    if (this.#mobileMenuBtn) {
      this.#mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    }
  }
}

