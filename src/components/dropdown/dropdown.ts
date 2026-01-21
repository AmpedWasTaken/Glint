import { emit } from "../../internal/events.js";
import { createFocusTrap } from "../../internal/focus.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block;position:relative}
    :host{--gl-dropdown-dur:var(--gl-dur-2);--gl-dropdown-ease:var(--gl-ease-spring);--gl-dropdown-amp:1}
    :host([motion="none"]){--gl-dropdown-dur:0ms}
    :host([motion="subtle"]){--gl-dropdown-dur:var(--gl-dur-3);--gl-dropdown-ease:var(--gl-ease-out);--gl-dropdown-amp:0.7}
    :host([motion="snappy"]){--gl-dropdown-dur:var(--gl-dur-2);--gl-dropdown-ease:var(--gl-ease-spring);--gl-dropdown-amp:1}
    :host([motion="bounce"]){--gl-dropdown-dur:var(--gl-dur-4);--gl-dropdown-ease:var(--gl-ease-bounce);--gl-dropdown-amp:1.15}
    .trigger{display:inline-block;cursor:pointer}
    .menu{
      position:absolute;
      top:calc(100% + 6px);
      left:0;
      min-width:180px;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:var(--gl-radius);
      box-shadow:var(--gl-shadow-lg);
      padding:6px;
      z-index:var(--gl-z-tooltip);
      display:none;
      opacity:0;
      transform:translateY(calc(-6px * var(--gl-motion) * var(--gl-dropdown-amp))) scale(0.98);
      transition:opacity var(--gl-dropdown-dur) var(--gl-dropdown-ease), transform var(--gl-dropdown-dur) var(--gl-dropdown-ease);
      max-height:min(320px, 80vh);
      overflow:auto;
    }
    :host([open]) .menu{
      display:block;
      opacity:1;
      transform:translateY(0) scale(1);
    }
    :host([motion="bounce"][open]) .menu{transform:translateY(0) scale(1.02)}
    :host([side="right"]) .menu{left:auto;right:0}
    :host([side="top"]) .menu{top:auto;bottom:calc(100% + 6px);transform:translateY(calc(6px * var(--gl-motion) * var(--gl-dropdown-amp))) scale(0.98)}
    :host([side="top"][open]) .menu{transform:translateY(0) scale(1)}
    .item{
      display:block;
      width:100%;
      padding:8px 12px;
      border:none;
      background:transparent;
      color:var(--gl-fg);
      text-align:left;
      cursor:pointer;
      border-radius:8px;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      transition:background var(--gl-dur-1) var(--gl-ease);
    }
    .item:hover{background:var(--gl-hover)}
    .item:focus-visible{outline:2px solid var(--gl-ring);outline-offset:2px}
    .item[disabled]{opacity:0.5;cursor:not-allowed;pointer-events:none}
    .divider{height:1px;background:var(--gl-border);margin:6px 0}
  </style>
  <div part="trigger" class="trigger"><slot name="trigger"></slot></div>
  <div part="menu" class="menu" role="menu" aria-hidden="true">
    <slot></slot>
  </div>
`;

export class GlDropdown extends HTMLElement {
  static tagName = "gl-dropdown";
  static get observedAttributes() {
    return ["open", "side"];
  }

  #trigger!: HTMLDivElement;
  #menu!: HTMLDivElement;
  #trap?: ReturnType<typeof createFocusTrap>;
  #onClickOutside?: (e: MouseEvent) => void;
  #onKeydown?: (e: KeyboardEvent) => void;

  get open() {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    if (v) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#trigger = this.shadowRoot!.querySelector(".trigger") as HTMLDivElement;
    this.#menu = this.shadowRoot!.querySelector(".menu") as HTMLDivElement;
    this.#sync();

    const slot = this.shadowRoot!.querySelector("slot");
    slot?.addEventListener("slotchange", () => {
      queueMicrotask(() => this.#wireItems());
    });
    queueMicrotask(() => this.#wireItems());

    this.#trigger.addEventListener("click", () => this.toggle());
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.open) {
        e.preventDefault();
        this.close("escape");
      }
    });
  }

  disconnectedCallback() {
    this.#cleanup();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  show() {
    if (this.open) return;
    this.open = true;
  }

  close(reason: "escape" | "click" | "api" = "api") {
    if (!this.open) return;
    this.open = false;
    emit(this, "gl-close", { reason });
  }

  toggle() {
    if (this.open) this.close("click");
    else this.show();
  }

  #sync() {
    if (!this.#menu) return;
    const isOpen = this.open;
    this.#menu.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) {
      this.#trap = createFocusTrap(this.#menu);
      this.#trap.activate();
      this.#onClickOutside = (e: MouseEvent) => {
        if (!this.contains(e.target as Node)) {
          this.close("click");
        }
      };
      this.#onKeydown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          this.close("escape");
        }
      };
      document.addEventListener("click", this.#onClickOutside, true);
      document.addEventListener("keydown", this.#onKeydown, true);
      queueMicrotask(() => {
        const first = this.#menu.querySelector<HTMLElement>("[role='menuitem']");
        first?.focus();
      });
    } else {
      this.#cleanup();
    }
  }

  #cleanup() {
    if (this.#trap) {
      this.#trap.deactivate();
      this.#trap = undefined;
    }
    if (this.#onClickOutside) {
      document.removeEventListener("click", this.#onClickOutside, true);
      this.#onClickOutside = undefined;
    }
    if (this.#onKeydown) {
      document.removeEventListener("keydown", this.#onKeydown, true);
      this.#onKeydown = undefined;
    }
  }

  #wireItems() {
    const items = Array.from(this.querySelectorAll<HTMLElement>("[role='menuitem'], .item"));
    items.forEach((item, i) => {
      if (item.hasAttribute("data-wired")) return;
      item.setAttribute("data-wired", "true");
      item.setAttribute("role", "menuitem");
      item.addEventListener("click", () => {
        emit(this, "gl-select", { value: item.dataset.value || item.textContent?.trim() || "", index: i });
        this.close("click");
      });
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          item.click();
        }
      });
    });
  }
}

