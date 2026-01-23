import { emit } from "../../internal/events.js";
import { rovingKeydown } from "../../internal/roving.js";

const tabsTemplate = document.createElement("template");
tabsTemplate.innerHTML = `
  <style>
    :host{display:block}
    .wrap{display:grid;gap:var(--gl-space-3)}
    .list{
      display:flex;
      gap:var(--gl-space-2);
      padding:var(--gl-space-1);
      border:1px solid var(--gl-border);
      border-radius:var(--gl-radius);
      background:var(--gl-panel);
      box-shadow:var(--gl-shadow-sm);
      width:max-content;
      max-width:100%;
      overflow:auto;
    }
    :host([orientation="vertical"]) .wrap{
      display:grid;
      grid-template-columns:auto 1fr;
      gap:var(--gl-space-4);
      align-items:start;
    }
    :host([orientation="vertical"]) .list{
      flex-direction:column;
      width:auto;
      min-width:200px;
    }
    :host([orientation="vertical"]) .panels{
      min-width:0;
    }
    ::slotted(gl-tab){flex:0 0 auto}
    .panels{min-width:0}
  </style>
  <div class="wrap" part="tabs">
    <div class="list" part="list" role="tablist"><slot name="tabs"></slot></div>
    <div class="panels" part="panels"><slot name="panels"></slot></div>
  </div>
`;

const tabTemplate = document.createElement("template");
tabTemplate.innerHTML = `
  <style>
    :host{display:inline-block}
    button{
      all:unset;
      cursor:pointer;
      user-select:none;
      padding:10px 12px;
      border-radius:10px;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      color:var(--gl-muted);
      font-weight:500;
      position:relative;
    }
    button::after{
      content:"";
      position:absolute;
      bottom:2px;
      left:12px;
      right:12px;
      height:2px;
      background:var(--gl-primary);
      border-radius:1px;
      transform:scaleX(0);
      transition:transform var(--gl-dur-3) var(--gl-ease-spring);
    }
    :host([active]) button::after{
      transform:scaleX(1);
    }
    :host([motion="none"]) button{transition:none}
    :host([motion="subtle"]) button{transition:background var(--gl-dur-3) var(--gl-ease-out), color var(--gl-dur-3) var(--gl-ease-out), transform var(--gl-dur-3) var(--gl-ease-out)}
    :host([motion="snappy"]) button{transition:background var(--gl-dur-2) var(--gl-ease-spring), color var(--gl-dur-2) var(--gl-ease-spring), transform var(--gl-dur-2) var(--gl-ease-spring)}
    :host([motion="bounce"]) button{transition:background var(--gl-dur-4) var(--gl-ease-bounce), color var(--gl-dur-4) var(--gl-ease-bounce), transform var(--gl-dur-4) var(--gl-ease-bounce)}
    :host(:not([motion])) button{transition:background var(--gl-dur-1) var(--gl-ease), color var(--gl-dur-1) var(--gl-ease)}
    :host([active]) button{
      background:color-mix(in srgb, var(--gl-primary) 12%, transparent);
      color:var(--gl-fg);
    }
    :host([motion="snappy"][active]) button::after{
      transition:transform var(--gl-dur-2) var(--gl-ease-spring);
    }
    :host([motion="bounce"][active]) button::after{
      transition:transform var(--gl-dur-4) var(--gl-ease-bounce);
    }
    :host([motion="snappy"][active]) button{transform:scale(1.03)}
    :host([motion="bounce"][active]) button{transform:scale(1.05)}
    button:hover{background:var(--gl-hover)}
    button:focus-visible{outline:2px solid var(--gl-ring);outline-offset:2px}
  </style>
  <button part="tab" role="tab" type="button"><slot></slot></button>
`;

const panelTemplate = document.createElement("template");
panelTemplate.innerHTML = `
  <style>
    :host{display:block}
    :host(:not([active])){display:none;opacity:0;max-height:0;overflow:hidden}
    :host([active]){opacity:1;max-height:2000px;transition:opacity var(--gl-dur-2) var(--gl-ease-out), max-height var(--gl-dur-3) var(--gl-ease-out)}
  </style>
  <div part="panel" role="tabpanel"><slot></slot></div>
`;

export class GlTab extends HTMLElement {
  static tagName = "gl-tab";
  static get observedAttributes() {
    return ["active", "disabled", "value"];
  }

  #btn!: HTMLButtonElement;
  #id = `gl-tab-${Math.random().toString(16).slice(2)}`;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(tabTemplate.content.cloneNode(true));
    this.#btn = this.shadowRoot!.querySelector("button")!;
    this.#btn.id = this.#id;
    this.#sync();

    this.#btn.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      const root = this.closest(GlTabs.tagName) as GlTabs | null;
      root?.select(this.value);
    });

    this.#btn.addEventListener("keydown", (e) => {
      const root = this.closest(GlTabs.tagName) as GlTabs | null;
      if (!root) return;
      const tabs = root.tabs;
      const orientation = root.getAttribute("orientation") || "horizontal";
      rovingKeydown(
        e,
        tabs.map((t) => t.#btn),
        this.#btn,
        { vertical: orientation === "vertical" }
      );
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!this.hasAttribute("disabled")) root.select(this.value);
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get value() {
    return this.getAttribute("value") ?? "";
  }

  get idForAria() {
    return this.#id;
  }

  #sync() {
    if (!this.#btn) return;
    const active = this.hasAttribute("active");
    const disabled = this.hasAttribute("disabled");
    this.#btn.setAttribute("aria-selected", String(active));
    this.#btn.setAttribute("aria-disabled", String(disabled));
    this.#btn.tabIndex = active && !disabled ? 0 : -1;
  }
}

export class GlTabPanel extends HTMLElement {
  static tagName = "gl-tab-panel";
  static get observedAttributes() {
    return ["active", "value"];
  }

  #root!: HTMLElement;
  #id = `gl-panel-${Math.random().toString(16).slice(2)}`;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(panelTemplate.content.cloneNode(true));
    this.#root = this.shadowRoot!.querySelector("[role='tabpanel']") as HTMLElement;
    this.#root.id = this.#id;
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get value() {
    return this.getAttribute("value") ?? "";
  }

  get idForAria() {
    return this.#id;
  }

  #sync() {
    if (!this.#root) return;
  }
}

export class GlTabs extends HTMLElement {
  static tagName = "gl-tabs";
  static get observedAttributes() {
    return ["value", "orientation"];
  }

  get value() {
    return this.getAttribute("value") ?? "";
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  get tabs(): GlTab[] {
    return Array.from(this.querySelectorAll<GlTab>(GlTab.tagName));
  }

  get panels(): GlTabPanel[] {
    return Array.from(this.querySelectorAll<GlTabPanel>(GlTabPanel.tagName));
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(tabsTemplate.content.cloneNode(true));
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  select(value: string) {
    this.value = value;
    emit(this, "gl-change", { value });
  }

  #sync() {
    const current =
      this.value ||
      this.tabs.find((t) => t.hasAttribute("active"))?.value ||
      this.tabs[0]?.value ||
      "";
    if (current && this.value !== current) this.value = current;

    const tabs = this.tabs;
    const panels = this.panels;
    const activeTab = tabs.find((t) => t.value === this.value) ?? tabs[0];
    const activePanel = panels.find((p) => p.value === this.value) ?? panels[0];

    for (const t of tabs) t.toggleAttribute("active", t === activeTab);
    for (const p of panels) p.toggleAttribute("active", p === activePanel);

    if (activeTab && activePanel) {
      activeTab.setAttribute("aria-controls", activePanel.idForAria);
      activePanel.setAttribute("aria-labelledby", activeTab.idForAria);
    }
  }
}
