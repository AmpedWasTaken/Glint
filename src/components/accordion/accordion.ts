import { emit } from "../../internal/events.js";

const itemTemplate = document.createElement("template");
itemTemplate.innerHTML = `
  <style>
    :host{display:block}
    .item{
      border:1px solid var(--gl-border);
      border-radius:var(--gl-radius);
      background:var(--gl-panel);
      overflow:hidden;
      box-shadow:var(--gl-shadow-sm);
      transition:box-shadow var(--gl-dur-1) var(--gl-ease), transform var(--gl-dur-1) var(--gl-ease);
    }
    .item:hover{box-shadow:var(--gl-shadow-md);transform:translateY(-1px)}
    .header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:var(--gl-space-3);
      padding:14px 16px;
      cursor:pointer;
      user-select:none;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      font-weight:500;
      transition:background var(--gl-dur-1) var(--gl-ease);
    }
    .header:hover{background:var(--gl-hover)}
    .chev{width:18px;height:18px;transition:transform var(--gl-dur-2) var(--gl-ease-spring);opacity:0.7;flex-shrink:0}
    :host([open]) .chev{transform:rotate(180deg)}
    .panel{
      padding:0 16px 16px;
      color:var(--gl-muted);
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      max-height:0;
      overflow:hidden;
      transition:max-height var(--gl-dur-4) var(--gl-ease-out), padding var(--gl-dur-2) var(--gl-ease), opacity var(--gl-dur-3) var(--gl-ease-out), transform var(--gl-dur-3) var(--gl-ease-out);
      opacity:0;
      transform:translateY(-4px);
    }
    :host([open]) .panel{
      max-height:500px;
      opacity:1;
      padding-top:8px;
      transform:translateY(0);
    }
    .header:focus-visible{outline:2px solid var(--gl-ring); outline-offset:2px; border-radius:10px}
  </style>
  <div class="item" part="item">
    <div class="header" part="header" role="button" tabindex="0" aria-expanded="false">
      <slot name="title"></slot>
      <svg class="chev" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7 10l5 5 5-5z"></path>
      </svg>
    </div>
    <div class="panel" part="panel" role="region"><slot></slot></div>
  </div>
`;

export class GlAccordionItem extends HTMLElement {
  static tagName = "gl-accordion-item";
  static get observedAttributes() {
    return ["open", "disabled"];
  }

  #header!: HTMLElement;
  #panel!: HTMLElement;
  #panelId = `gl-acc-panel-${Math.random().toString(16).slice(2)}`;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(itemTemplate.content.cloneNode(true));
    this.#header = this.shadowRoot!.querySelector(".header") as HTMLElement;
    this.#panel = this.shadowRoot!.querySelector(".panel") as HTMLElement;
    this.#panel.id = this.#panelId;
    this.#header.setAttribute("aria-controls", this.#panelId);
    this.#sync();

    this.#header.addEventListener("click", () => this.toggle());
    this.#header.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(v: boolean) {
    if (v) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  toggle(force?: boolean) {
    if (this.hasAttribute("disabled")) return;
    const next = typeof force === "boolean" ? force : !this.open;

    const root = this.closest(GlAccordion.tagName) as GlAccordion | null;
    if (root && !root.multiple && next) {
      for (const item of Array.from(
        root.querySelectorAll<GlAccordionItem>(GlAccordionItem.tagName)
      )) {
        if (item !== this) item.open = false;
      }
    }

    this.open = next;
    emit(this, "gl-toggle", { open: this.open });
  }

  #sync() {
    if (!this.#header) return;
    const open = this.open;
    const disabled = this.hasAttribute("disabled");
    this.#header.setAttribute("aria-expanded", String(open));
    this.#header.setAttribute("aria-disabled", String(disabled));
    this.#header.tabIndex = disabled ? -1 : 0;
  }
}

const accTemplate = document.createElement("template");
accTemplate.innerHTML = `
  <style>
    :host{display:block}
    .stack{display:grid;gap:var(--gl-space-3)}
  </style>
  <div class="stack" part="accordion"><slot></slot></div>
`;

export class GlAccordion extends HTMLElement {
  static tagName = "gl-accordion";
  static get observedAttributes() {
    return ["multiple"];
  }

  get multiple() {
    return this.hasAttribute("multiple");
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(accTemplate.content.cloneNode(true));
  }
}
