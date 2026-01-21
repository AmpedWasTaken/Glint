import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    .alert{
      background:var(--gl-panel);
      color:var(--gl-fg);
      border:1px solid var(--gl-border);
      border-radius:var(--gl-radius);
      padding:14px 16px;
      display:flex;
      align-items:flex-start;
      gap:var(--gl-space-3);
      box-shadow:var(--gl-shadow-sm);
      opacity:1;
      transform:none;
      transition:box-shadow var(--gl-dur-1) var(--gl-ease), transform var(--gl-dur-1) var(--gl-ease);
    }
    :host([data-enter]) .alert{opacity:0;transform:translateX(-12px) scale(0.98)}
    :host([motion="subtle"]:hover) .alert{box-shadow:var(--gl-shadow-md);transform:translateY(-1px)}
    :host([motion="snappy"]:hover) .alert{box-shadow:var(--gl-shadow-md);transform:translateY(-2px) scale(1.01)}
    .icon{width:20px;height:20px;flex-shrink:0;opacity:0.8}
    .content{flex:1;min-width:0}
    .title{font-weight:600;font-size:var(--gl-text-md);line-height:var(--gl-line-md);margin:0 0 4px}
    .desc{color:var(--gl-muted);font-size:var(--gl-text-md);line-height:var(--gl-line-md);margin:0}
    .close{
      all:unset;
      cursor:pointer;
      padding:4px;
      border-radius:8px;
      color:var(--gl-muted);
      opacity:0.7;
      transition:opacity var(--gl-dur-1) var(--gl-ease), background var(--gl-dur-1) var(--gl-ease);
    }
    .close:hover{opacity:1;background:var(--gl-hover)}
    :host([variant="default"]) .alert{border-left:3px solid var(--gl-primary)}
    :host([variant="destructive"]) .alert{
      border-left:3px solid var(--gl-danger);
      background:color-mix(in srgb, var(--gl-danger) 8%, var(--gl-panel));
    }
    :host([variant="success"]) .alert{
      border-left:3px solid #10b981;
      background:color-mix(in srgb, #10b981 8%, var(--gl-panel));
    }
    :host([variant="warning"]) .alert{
      border-left:3px solid #f59e0b;
      background:color-mix(in srgb, #f59e0b 8%, var(--gl-panel));
    }
  </style>
  <div part="alert" class="alert" role="alert">
    <slot name="icon">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
      </svg>
    </slot>
    <div class="content">
      <div class="title" part="title"><slot name="title"></slot></div>
      <div class="desc" part="description"><slot></slot></div>
    </div>
    <button class="close" part="close" type="button" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7A1 1 0 0 0 5.7 7.1L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4Z"></path>
      </svg>
    </button>
  </div>
`;

export class GlAlert extends HTMLElement {
  static tagName = "gl-alert";
  static get observedAttributes() {
    return ["variant"];
  }

  #closeBtn!: HTMLButtonElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) root.appendChild(template.content.cloneNode(true));
    this.#closeBtn = this.shadowRoot!.querySelector(".close") as HTMLButtonElement;
    this.#closeBtn.addEventListener("click", () => {
      emit(this, "gl-close");
      this.remove();
    });

    const animate = this.getAttribute("motion") !== "none";
    if (animate) {
      this.setAttribute("data-enter", "");
      requestAnimationFrame(() => this.removeAttribute("data-enter"));
    } else {
      this.removeAttribute("data-enter");
    }
  }
}
