import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:contents}
    :host{--gl-motion-dur:var(--gl-dur-2);--gl-motion-ease:var(--gl-ease-spring)}
    :host([motion="none"]){--gl-motion-dur:0ms}
    :host([motion="snappy"]){--gl-motion-dur:var(--gl-dur-3);--gl-motion-ease:var(--gl-ease-spring)}
    :host([motion="subtle"]){--gl-motion-dur:var(--gl-dur-2);--gl-motion-ease:var(--gl-ease)}
    .overlay{
      position:fixed;
      inset:0;
      background:color-mix(in srgb, var(--gl-overlay) 65%, transparent);
      z-index:var(--gl-z-modal);
      display:none;
    }
    :host([open]) .overlay{display:block}
    .drawer{
      position:fixed;
      top:0;
      bottom:0;
      left:0;
      width:min(320px, 92vw);
      background:var(--gl-panel);
      color:var(--gl-fg);
      border-right:1px solid var(--gl-border);
      box-shadow:var(--gl-shadow-md);
      transform:translateX(calc(-12px * var(--gl-motion)));
      opacity:0;
      transition:opacity var(--gl-motion-dur) var(--gl-motion-ease), transform var(--gl-motion-dur) var(--gl-motion-ease);
      z-index:calc(var(--gl-z-modal) + 1);
      display:none;
      overflow:auto;
    }
    :host([open]) .drawer{
      display:block;
      transform:translateX(0);
      opacity:1;
    }
    .header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:var(--gl-space-3);
      padding:var(--gl-space-4);
      border-bottom:1px solid var(--gl-border);
    }
    .title{font-weight:600}
    .close{
      all:unset;
      cursor:pointer;
      padding:6px;
      border-radius:10px;
      color:var(--gl-muted);
    }
    .close:focus-visible{outline:2px solid var(--gl-ring); outline-offset:2px}
    .close:hover{background:var(--gl-hover)}
    .content{padding:var(--gl-space-4)}
  </style>
  <div class="overlay" part="overlay"></div>
  <aside class="drawer" part="drawer" role="complementary" aria-hidden="true" tabindex="-1">
    <div class="header" part="header">
      <div class="title" part="title"><slot name="title"></slot></div>
      <button class="close" part="close" type="button" aria-label="Close sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7A1 1 0 0 0 5.7 7.1L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4Z"></path>
        </svg>
      </button>
    </div>
    <div class="content" part="content"><slot></slot></div>
  </aside>
`;

export class GlSidebar extends HTMLElement {
  static tagName = "gl-sidebar";
  static get observedAttributes() {
    return ["open"];
  }

  #overlay!: HTMLDivElement;
  #drawer!: HTMLElement;
  #close!: HTMLButtonElement;

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
    this.#overlay = this.shadowRoot!.querySelector(".overlay") as HTMLDivElement;
    this.#drawer = this.shadowRoot!.querySelector(".drawer") as HTMLElement;
    this.#close = this.shadowRoot!.querySelector(".close") as HTMLButtonElement;
    this.#sync();

    this.#overlay.addEventListener("click", () => this.close("backdrop"));
    this.#close.addEventListener("click", () => this.close("close"));
    this.addEventListener("keydown", (e) => {
      if (!this.open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this.close("escape");
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  show() {
    if (this.open) return;
    this.open = true;
  }

  close(reason: "escape" | "backdrop" | "close" | "api" = "api") {
    if (!this.open) return;
    this.open = false;
    emit(this, "gl-close", { reason });
  }

  #sync() {
    if (!this.#drawer) return;
    const open = this.open;
    this.#drawer.setAttribute("aria-hidden", String(!open));
    if (open) queueMicrotask(() => this.#drawer.focus());
  }
}
