import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: var(--gl-z-modal, 50);
      pointer-events: none;
    }
    :host([open]) {
      pointer-events: auto;
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity var(--gl-dur-2) var(--gl-ease-out);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    :host([open]) .backdrop {
      opacity: 1;
    }
    .drawer {
      position: absolute;
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      box-shadow: var(--gl-shadow-xl);
      display: flex;
      flex-direction: column;
      max-height: 100vh;
      overflow: hidden;
      transition: transform var(--gl-dur-3) var(--gl-ease-out);
    }
    :host([side="bottom"]) .drawer {
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      border-left: none;
      border-right: none;
      border-bottom: none;
      border-radius: var(--gl-radius-lg) var(--gl-radius-lg) 0 0;
      transform: translateY(100%);
      max-height: 90vh;
    }
    :host([side="top"]) .drawer {
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      border-left: none;
      border-right: none;
      border-top: none;
      border-radius: 0 0 var(--gl-radius-lg) var(--gl-radius-lg);
      transform: translateY(-100%);
      max-height: 90vh;
    }
    :host([side="left"]) .drawer {
      top: 0;
      left: 0;
      bottom: 0;
      height: 100%;
      border-left: none;
      border-top: none;
      border-bottom: none;
      border-radius: 0 var(--gl-radius-lg) var(--gl-radius-lg) 0;
      transform: translateX(-100%);
      max-width: 90vw;
    }
    :host([side="right"]) .drawer {
      top: 0;
      right: 0;
      bottom: 0;
      height: 100%;
      border-right: none;
      border-top: none;
      border-bottom: none;
      border-radius: var(--gl-radius-lg) 0 0 var(--gl-radius-lg);
      transform: translateX(100%);
      max-width: 90vw;
    }
    :host([open][side="bottom"]) .drawer,
    :host([open][side="top"]) .drawer {
      transform: translateY(0);
    }
    :host([open][side="left"]) .drawer,
    :host([open][side="right"]) .drawer {
      transform: translateX(0);
    }
    :host([motion="snappy"]) .drawer {
      transition: transform var(--gl-dur-1) var(--gl-ease-spring);
    }
    :host([motion="bounce"]) .drawer {
      transition: transform var(--gl-dur-2) var(--gl-ease-bounce);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--gl-space-4);
      border-bottom: 1px solid var(--gl-border);
      flex-shrink: 0;
    }
    .header:empty {
      display: none;
    }
    .title {
      font-size: var(--gl-text-lg);
      font-weight: 600;
      color: var(--gl-fg);
      margin: 0;
    }
    .close {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--gl-radius-sm);
      color: var(--gl-muted);
      transition: background var(--gl-dur-1) var(--gl-ease), color var(--gl-dur-1) var(--gl-ease);
    }
    .close:hover {
      background: var(--gl-hover);
      color: var(--gl-fg);
    }
    .body {
      flex: 1;
      overflow-y: auto;
      padding: var(--gl-space-4);
    }
    .body:empty {
      display: none;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--gl-space-2);
      padding: var(--gl-space-4);
      border-top: 1px solid var(--gl-border);
      flex-shrink: 0;
    }
    .footer:empty {
      display: none;
    }
    :host([size="sm"][side="bottom"]) .drawer,
    :host([size="sm"][side="top"]) .drawer {
      max-height: 40vh;
    }
    :host([size="md"][side="bottom"]) .drawer,
    :host([size="md"][side="top"]) .drawer {
      max-height: 60vh;
    }
    :host([size="lg"][side="bottom"]) .drawer,
    :host([size="lg"][side="top"]) .drawer {
      max-height: 80vh;
    }
    :host([size="sm"][side="left"]) .drawer,
    :host([size="sm"][side="right"]) .drawer {
      max-width: 320px;
    }
    :host([size="md"][side="left"]) .drawer,
    :host([size="md"][side="right"]) .drawer {
      max-width: 480px;
    }
    :host([size="lg"][side="left"]) .drawer,
    :host([size="lg"][side="right"]) .drawer {
      max-width: 640px;
    }
    :host([size="xl"][side="left"]) .drawer,
    :host([size="xl"][side="right"]) .drawer {
      max-width: 800px;
    }
    @media (prefers-reduced-motion: reduce) {
      .drawer,
      .backdrop {
        transition: none;
      }
    }
  </style>
  <div class="backdrop" part="backdrop"></div>
  <div class="drawer" part="drawer" role="dialog" aria-modal="true">
    <div class="header" part="header">
      <h2 class="title" part="title"><slot name="title"></slot></h2>
      <button class="close" part="close" aria-label="Close" type="button">×</button>
    </div>
    <div class="body" part="body">
      <slot></slot>
    </div>
    <div class="footer" part="footer">
      <slot name="footer"></slot>
    </div>
  </div>
`;

export class GlDrawer extends HTMLElement {
  static tagName = "gl-drawer";
  static get observedAttributes() {
    return ["open", "side", "size", "motion"];
  }

  #drawer!: HTMLElement;
  #backdrop!: HTMLElement;
  #close!: HTMLButtonElement;

  get open() {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    if (v) {
      this.setAttribute("open", "");
      document.body.style.overflow = "hidden";
    } else {
      this.removeAttribute("open");
      document.body.style.overflow = "";
    }
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#drawer = this.shadowRoot!.querySelector(".drawer") as HTMLElement;
    this.#backdrop = this.shadowRoot!.querySelector(".backdrop") as HTMLElement;
    this.#close = this.shadowRoot!.querySelector(".close") as HTMLButtonElement;

    if (!this.hasAttribute("side")) {
      this.setAttribute("side", "bottom");
    }

    this.#close.addEventListener("click", () => {
      this.open = false;
      emit(this, "gl-close");
    });

    this.#backdrop.addEventListener("click", () => {
      if (this.hasAttribute("close-on-backdrop")) {
        this.open = false;
        emit(this, "gl-close");
      }
    });

    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.open) {
        this.open = false;
        emit(this, "gl-close");
      }
    });

    // Focus trap
    this.#setupFocusTrap();
  }

  attributeChangedCallback(name: string) {
    if (name === "open") {
      const isOpen = this.hasAttribute("open");
      if (isOpen) {
        this.#drawer.focus();
        emit(this, "gl-open");
      } else {
        emit(this, "gl-close");
      }
    }
  }

  #setupFocusTrap() {
    const focusable = this.shadowRoot!.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    this.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !this.open) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    });
  }
}

