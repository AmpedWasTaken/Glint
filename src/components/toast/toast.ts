import { emit } from "../../internal/events.js";

const toastTemplate = document.createElement("template");
toastTemplate.innerHTML = `
  <style>
    :host{display:block}
    .toast{
      background:var(--gl-panel);
      color:var(--gl-fg);
      border:1px solid var(--gl-border);
      border-radius:var(--gl-radius);
      box-shadow:var(--gl-shadow-md);
      padding:12px 14px;
      display:grid;
      gap:6px;
      min-width:280px;
      max-width:min(420px, calc(100vw - 24px));
      pointer-events:auto;
    }
    .top{display:flex; align-items:flex-start; justify-content:space-between; gap:var(--gl-space-3)}
    .title{font-weight:600; font-size:var(--gl-text-md); line-height:var(--gl-line-md)}
    .desc{color:var(--gl-muted); font-size:var(--gl-text-md); line-height:var(--gl-line-md)}
    .actions{display:flex; gap:var(--gl-space-2); justify-content:flex-end}
    .close{
      all:unset;
      cursor:pointer;
      padding:4px;
      border-radius:8px;
      color:var(--gl-muted);
    }
    .close:focus-visible{outline:2px solid var(--gl-ring); outline-offset:2px}
    .close:hover{background:rgba(2,6,23,0.06)}
    [data-glint-theme="dark"] .close:hover{background:rgba(226,232,240,0.08)}
  </style>
  <div class="toast" part="toast" role="status" aria-live="polite">
    <div class="top">
      <div>
        <div class="title" part="title"><slot name="title"></slot></div>
        <div class="desc" part="description"><slot name="description"></slot></div>
      </div>
      <button class="close" part="close" type="button" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7A1 1 0 0 0 5.7 7.1L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4Z"></path>
        </svg>
      </button>
    </div>
    <div class="actions" part="actions"><slot name="actions"></slot></div>
  </div>
`;

export class GlToast extends HTMLElement {
  static tagName = "gl-toast";
  static get observedAttributes() {
    return ["duration"];
  }

  #closeBtn!: HTMLButtonElement;
  #timer: number | null = null;
  #remaining = 0;
  #until = 0;

  get duration() {
    const v = Number(this.getAttribute("duration") ?? "0");
    return Number.isFinite(v) ? v : 0;
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(toastTemplate.content.cloneNode(true));
    this.#closeBtn = this.shadowRoot!.querySelector(".close") as HTMLButtonElement;

    this.#closeBtn.addEventListener("click", () => this.dismiss("close"));
    this.addEventListener("mouseenter", () => this.#pause());
    this.addEventListener("mouseleave", () => this.#resume());

    this.#resume();
  }

  disconnectedCallback() {
    this.#clear();
  }

  attributeChangedCallback() {
    this.#clear();
    this.#resume();
  }

  dismiss(reason: "timeout" | "close" | "api" = "api") {
    this.#clear();
    emit(this, "gl-dismiss", { reason });
    this.remove();
  }

  #clear() {
    if (this.#timer) window.clearTimeout(this.#timer);
    this.#timer = null;
  }

  #pause() {
    if (!this.#timer) return;
    this.#clear();
    this.#remaining = Math.max(0, this.#until - Date.now());
  }

  #resume() {
    const d = this.duration;
    const ms = this.#remaining > 0 ? this.#remaining : d;
    this.#remaining = 0;
    if (!ms || ms <= 0) return;
    this.#until = Date.now() + ms;
    this.#timer = window.setTimeout(() => this.dismiss("timeout"), ms);
  }
}

const toasterTemplate = document.createElement("template");
toasterTemplate.innerHTML = `
  <style>
    :host{
      position:fixed;
      inset:auto 16px 16px auto;
      z-index:var(--gl-z-toast);
      display:grid;
      gap:var(--gl-space-2);
      pointer-events:none;
    }
  </style>
  <slot></slot>
`;

export class GlToaster extends HTMLElement {
  static tagName = "gl-toaster";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(toasterTemplate.content.cloneNode(true));
  }

  show(opts: { title?: string; description?: string; duration?: number } = {}) {
    const t = document.createElement(GlToast.tagName) as GlToast;
    if (opts.duration) t.setAttribute("duration", String(opts.duration));
    if (opts.title) {
      const n = document.createElement("span");
      n.slot = "title";
      n.textContent = opts.title;
      t.appendChild(n);
    }
    if (opts.description) {
      const n = document.createElement("span");
      n.slot = "description";
      n.textContent = opts.description;
      t.appendChild(n);
    }
    this.appendChild(t);
    return t;
  }
}


