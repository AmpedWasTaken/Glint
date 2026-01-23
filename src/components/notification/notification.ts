import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .notification {
      background: var(--gl-panel);
      color: var(--gl-fg);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      padding: var(--gl-space-4);
      display: flex;
      align-items: flex-start;
      gap: var(--gl-space-3);
      box-shadow: var(--gl-shadow-md);
      position: relative;
      transition: all var(--gl-dur-1) var(--gl-ease);
    }
    .notification:hover {
      box-shadow: var(--gl-shadow-lg);
    }
    .notification-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--gl-radius-sm);
    }
    .notification-content {
      flex: 1;
      min-width: 0;
    }
    .notification-title {
      font-weight: 600;
      font-size: var(--gl-text-md);
      line-height: var(--gl-line-md);
      margin: 0 0 var(--gl-space-1);
      color: var(--gl-fg);
    }
    .notification-description {
      color: var(--gl-muted);
      font-size: var(--gl-text-sm);
      line-height: var(--gl-line-sm);
      margin: 0 0 var(--gl-space-3);
    }
    .notification-actions {
      display: flex;
      gap: var(--gl-space-2);
      flex-wrap: wrap;
    }
    .notification-close {
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
    .notification-close:hover {
      opacity: 1;
      background: var(--gl-hover);
    }
    :host([variant="default"]) .notification {
      border-left: 4px solid var(--gl-primary);
    }
    :host([variant="default"]) .notification-icon {
      background: color-mix(in srgb, var(--gl-primary) 15%, transparent);
      color: var(--gl-primary);
    }
    :host([variant="success"]) .notification {
      border-left: 4px solid var(--gl-success);
    }
    :host([variant="success"]) .notification-icon {
      background: color-mix(in srgb, var(--gl-success) 15%, transparent);
      color: var(--gl-success);
    }
    :host([variant="warning"]) .notification {
      border-left: 4px solid #f59e0b;
    }
    :host([variant="warning"]) .notification-icon {
      background: color-mix(in srgb, #f59e0b 15%, transparent);
      color: #f59e0b;
    }
    :host([variant="destructive"]) .notification {
      border-left: 4px solid var(--gl-danger);
    }
    :host([variant="destructive"]) .notification-icon {
      background: color-mix(in srgb, var(--gl-danger) 15%, transparent);
      color: var(--gl-danger);
    }
    :host([variant="info"]) .notification {
      border-left: 4px solid #3b82f6;
    }
    :host([variant="info"]) .notification-icon {
      background: color-mix(in srgb, #3b82f6 15%, transparent);
      color: #3b82f6;
    }
  </style>
  <div class="notification" part="notification" role="alert">
    <div class="notification-icon" part="icon">
      <slot name="icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
        </svg>
      </slot>
    </div>
    <div class="notification-content" part="content">
      <div class="notification-title" part="title">
        <slot name="title"></slot>
      </div>
      <div class="notification-description" part="description">
        <slot></slot>
      </div>
      <div class="notification-actions" part="actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <button class="notification-close" part="close" type="button" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    </button>
  </div>
`;

export class GlNotification extends HTMLElement {
  static tagName = "gl-notification";
  static get observedAttributes() {
    return ["variant", "dismissible"];
  }

  #closeBtn!: HTMLButtonElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#closeBtn = this.shadowRoot!.querySelector(".notification-close") as HTMLButtonElement;
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
    emit(this, "gl-notification-dismiss");
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
}
