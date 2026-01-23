import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .banner {
      background: var(--gl-panel);
      color: var(--gl-fg);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      padding: var(--gl-space-4);
      display: flex;
      align-items: flex-start;
      gap: var(--gl-space-3);
      box-shadow: var(--gl-shadow-sm);
      position: relative;
    }
    .banner-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--gl-radius-sm);
    }
    .banner-content {
      flex: 1;
      min-width: 0;
    }
    .banner-title {
      font-weight: 600;
      font-size: var(--gl-text-md);
      line-height: var(--gl-line-md);
      margin: 0 0 var(--gl-space-1);
      color: var(--gl-fg);
    }
    .banner-description {
      color: var(--gl-muted);
      font-size: var(--gl-text-sm);
      line-height: var(--gl-line-sm);
      margin: 0 0 var(--gl-space-3);
    }
    .banner-actions {
      display: flex;
      gap: var(--gl-space-2);
      flex-wrap: wrap;
    }
    .banner-close {
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
    .banner-close:hover {
      opacity: 1;
      background: var(--gl-hover);
    }
    :host([variant="default"]) .banner {
      background: color-mix(in srgb, var(--gl-primary) 8%, var(--gl-panel));
      border-color: var(--gl-primary);
    }
    :host([variant="default"]) .banner-icon {
      background: color-mix(in srgb, var(--gl-primary) 15%, transparent);
      color: var(--gl-primary);
    }
    :host([variant="success"]) .banner {
      background: color-mix(in srgb, var(--gl-success) 8%, var(--gl-panel));
      border-color: var(--gl-success);
    }
    :host([variant="success"]) .banner-icon {
      background: color-mix(in srgb, var(--gl-success) 15%, transparent);
      color: var(--gl-success);
    }
    :host([variant="warning"]) .banner {
      background: color-mix(in srgb, #f59e0b 8%, var(--gl-panel));
      border-color: #f59e0b;
    }
    :host([variant="warning"]) .banner-icon {
      background: color-mix(in srgb, #f59e0b 15%, transparent);
      color: #f59e0b;
    }
    :host([variant="destructive"]) .banner {
      background: color-mix(in srgb, var(--gl-danger) 8%, var(--gl-panel));
      border-color: var(--gl-danger);
    }
    :host([variant="destructive"]) .banner-icon {
      background: color-mix(in srgb, var(--gl-danger) 15%, transparent);
      color: var(--gl-danger);
    }
    :host([variant="info"]) .banner {
      background: color-mix(in srgb, #3b82f6 8%, var(--gl-panel));
      border-color: #3b82f6;
    }
    :host([variant="info"]) .banner-icon {
      background: color-mix(in srgb, #3b82f6 15%, transparent);
      color: #3b82f6;
    }
    :host([full-width]) .banner {
      border-radius: 0;
      border-left: none;
      border-right: none;
    }
  </style>
  <div class="banner" part="banner" role="banner">
    <div class="banner-icon" part="icon">
      <slot name="icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
        </svg>
      </slot>
    </div>
    <div class="banner-content" part="content">
      <div class="banner-title" part="title">
        <slot name="title"></slot>
      </div>
      <div class="banner-description" part="description">
        <slot></slot>
      </div>
      <div class="banner-actions" part="actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <button class="banner-close" part="close" type="button" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    </button>
  </div>
`;

export class GlBanner extends HTMLElement {
  static tagName = "gl-banner";
  static get observedAttributes() {
    return ["variant", "dismissible", "full-width"];
  }

  #closeBtn!: HTMLButtonElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#closeBtn = this.shadowRoot!.querySelector(".banner-close") as HTMLButtonElement;
    this.#closeBtn.addEventListener("click", () => {
      this.dismiss();
    });

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const dismissible = this.hasAttribute("dismissible");
    if (this.#closeBtn) {
      this.#closeBtn.style.display = dismissible ? "flex" : "none";
    }
  }

  dismiss() {
    emit(this, "gl-banner-dismiss");
    this.remove();
  }

  get variant() {
    return this.getAttribute("variant") || "default";
  }

  set variant(v: string) {
    this.setAttribute("variant", v);
  }

  get dismissible() {
    return this.hasAttribute("dismissible");
  }

  set dismissible(v: boolean) {
    if (v) this.setAttribute("dismissible", "");
    else this.removeAttribute("dismissible");
  }

  get fullWidth() {
    return this.hasAttribute("full-width");
  }

  set fullWidth(v: boolean) {
    if (v) this.setAttribute("full-width", "");
    else this.removeAttribute("full-width");
  }
}
