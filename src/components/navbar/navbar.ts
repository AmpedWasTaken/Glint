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
    :host([mobile-menu]) .nav{display:none}
    @media (max-width: 768px) {
      .navbar {
        flex-wrap: wrap;
        padding: var(--gl-space-3);
        position:relative;
      }
      :host(:not([mobile-menu])) .nav {
        order: 3;
        width: 100%;
        margin-left: 0;
        margin-top: var(--gl-space-2);
        justify-content: flex-start;
      }
      :host(:not([mobile-menu])[align="center"]) .nav,
      :host(:not([mobile-menu])[align="end"]) .nav {
        margin-right: 0;
      }
      :host([mobile-menu]) .mobile-menu-btn{display:flex}
      :host([mobile-menu]) .nav{display:none}
    }
  </style>
  <nav class="navbar" part="navbar" role="navigation">
    <div part="brand" class="brand">
      <slot name="brand"></slot>
    </div>
    <button class="mobile-menu-btn" part="mobile-menu-btn" aria-label="Toggle menu" aria-expanded="false" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    </button>
    <div part="nav" class="nav">
      <slot name="nav"></slot>
    </div>
    <div part="actions" class="actions">
      <slot name="actions"></slot>
    </div>
    <div class="mobile-menu" part="mobile-menu">
      <slot name="nav"></slot>
    </div>
  </nav>
`;

export class GlNavbar extends HTMLElement {
  static tagName = "gl-navbar";
  static get observedAttributes() {
    return ["variant", "sticky", "align", "motion", "mobile-menu"];
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

