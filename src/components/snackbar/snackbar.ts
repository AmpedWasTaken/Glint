import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: fixed;
      bottom: var(--gl-space-4);
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      z-index: 1000;
      opacity: 0;
      transition: opacity var(--gl-dur-2) var(--gl-ease), transform var(--gl-dur-2) var(--gl-ease);
      pointer-events: none;
    }
    :host([open]) {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }
    .snackbar {
      background: var(--gl-panel);
      color: var(--gl-fg);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      padding: var(--gl-space-3) var(--gl-space-4);
      box-shadow: var(--gl-shadow-lg);
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
      min-width: 300px;
      max-width: min(500px, calc(100vw - 32px));
      backdrop-filter: blur(8px);
    }
    .snackbar-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
    }
    .snackbar-message {
      flex: 1;
      font-size: var(--gl-text-sm);
      line-height: var(--gl-line-sm);
      color: var(--gl-fg);
    }
    .snackbar-action {
      all: unset;
      cursor: pointer;
      padding: var(--gl-space-1) var(--gl-space-2);
      border-radius: var(--gl-radius-sm);
      font-size: var(--gl-text-sm);
      font-weight: 600;
      color: var(--gl-primary);
      transition: background var(--gl-dur-1) var(--gl-ease);
      white-space: nowrap;
    }
    .snackbar-action:hover {
      background: var(--gl-hover);
    }
    .snackbar-close {
      all: unset;
      cursor: pointer;
      padding: var(--gl-space-1);
      border-radius: var(--gl-radius-sm);
      color: var(--gl-muted);
      opacity: 0.7;
      transition: opacity var(--gl-dur-1) var(--gl-ease), background var(--gl-dur-1) var(--gl-ease);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .snackbar-close:hover {
      opacity: 1;
      background: var(--gl-hover);
    }
    :host([variant="success"]) .snackbar {
      border-left: 4px solid var(--gl-success);
    }
    :host([variant="warning"]) .snackbar {
      border-left: 4px solid #f59e0b;
    }
    :host([variant="destructive"]) .snackbar {
      border-left: 4px solid var(--gl-danger);
    }
    :host([variant="info"]) .snackbar {
      border-left: 4px solid #3b82f6;
    }
    :host([position="top"]) {
      top: var(--gl-space-4);
      bottom: auto;
    }
    :host([position="top-left"]) {
      top: var(--gl-space-4);
      left: var(--gl-space-4);
      bottom: auto;
      transform: translateY(-100px);
    }
    :host([position="top-left"][open]) {
      transform: translateY(0);
    }
    :host([position="top-right"]) {
      top: var(--gl-space-4);
      right: var(--gl-space-4);
      left: auto;
      bottom: auto;
      transform: translateX(0) translateY(-100px);
    }
    :host([position="top-right"][open]) {
      transform: translateX(0) translateY(0);
    }
    :host([position="bottom-left"]) {
      left: var(--gl-space-4);
      transform: translateX(0) translateY(100px);
    }
    :host([position="bottom-left"][open]) {
      transform: translateX(0) translateY(0);
    }
    :host([position="bottom-right"]) {
      right: var(--gl-space-4);
      left: auto;
      transform: translateX(0) translateY(100px);
    }
    :host([position="bottom-right"][open]) {
      transform: translateX(0) translateY(0);
    }
  </style>
  <div class="snackbar" part="snackbar" role="status" aria-live="polite">
    <div class="snackbar-content" part="content">
      <div class="snackbar-message" part="message">
        <slot></slot>
      </div>
      <slot name="action">
        <button class="snackbar-action" part="action" type="button">
          <slot name="action-label">Action</slot>
        </button>
      </slot>
    </div>
    <button class="snackbar-close" part="close" type="button" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    </button>
  </div>
`;

export class GlSnackbar extends HTMLElement {
  static tagName = "gl-snackbar";
  static get observedAttributes() {
    return ["open", "variant", "position", "duration"];
  }

  #closeBtn!: HTMLButtonElement;
  #actionBtn!: HTMLButtonElement;
  #autoDismissTimer?: number;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#closeBtn = this.shadowRoot!.querySelector(".snackbar-close") as HTMLButtonElement;
    this.#closeBtn.addEventListener("click", () => {
      this.close();
    });

    this.#actionBtn = this.shadowRoot!.querySelector(".snackbar-action") as HTMLButtonElement;
    this.#actionBtn.addEventListener("click", () => {
      emit(this, "gl-snackbar-action");
      this.close();
    });

    this.#sync();
  }

  attributeChangedCallback(name: string) {
    if (name === "open") {
      this.#sync();
    }
  }

  disconnectedCallback() {
    if (this.#autoDismissTimer) {
      clearTimeout(this.#autoDismissTimer);
    }
  }

  #sync() {
    if (this.open) {
      const duration = Number(this.getAttribute("duration")) || 0;
      if (duration > 0) {
        this.#autoDismissTimer = window.setTimeout(() => {
          this.close();
        }, duration);
      }
    } else {
      if (this.#autoDismissTimer) {
        clearTimeout(this.#autoDismissTimer);
        this.#autoDismissTimer = undefined;
      }
    }
  }

  open() {
    this.setAttribute("open", "");
    emit(this, "gl-snackbar-open");
  }

  close() {
    this.removeAttribute("open");
    emit(this, "gl-snackbar-close");
    if (this.hasAttribute("auto-remove")) {
      setTimeout(() => this.remove(), 300);
    }
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(v: boolean) {
    if (v) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  get variant() {
    return this.getAttribute("variant") || "default";
  }

  set variant(v: string) {
    this.setAttribute("variant", v);
  }

  get position() {
    return this.getAttribute("position") || "bottom";
  }

  set position(v: string) {
    this.setAttribute("position", v);
  }
}
