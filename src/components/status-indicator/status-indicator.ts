const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;
    }
    .indicator {
      display: inline-flex;
      align-items: center;
      gap: var(--gl-space-2);
    }
    .indicator-dot {
      width: var(--gl-space-2);
      height: var(--gl-space-2);
      border-radius: 50%;
      flex-shrink: 0;
      position: relative;
    }
    .indicator-dot[data-pulse] {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .indicator-dot[data-pulse]::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: inherit;
      opacity: 0.5;
      animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .indicator-label {
      font-size: var(--gl-text-sm);
      line-height: var(--gl-line-sm);
      color: var(--gl-fg);
    }
    :host([size="sm"]) .indicator-dot {
      width: 6px;
      height: 6px;
    }
    :host([size="md"]) .indicator-dot {
      width: var(--gl-space-2);
      height: var(--gl-space-2);
    }
    :host([size="lg"]) .indicator-dot {
      width: var(--gl-space-3);
      height: var(--gl-space-3);
    }
    :host([status="online"]) .indicator-dot {
      background: var(--gl-success);
    }
    :host([status="offline"]) .indicator-dot {
      background: var(--gl-muted);
    }
    :host([status="away"]) .indicator-dot {
      background: #f59e0b;
    }
    :host([status="busy"]) .indicator-dot {
      background: var(--gl-danger);
    }
    :host([status="pending"]) .indicator-dot {
      background: #3b82f6;
    }
    :host([status="warning"]) .indicator-dot {
      background: #f59e0b;
    }
    :host([status="error"]) .indicator-dot {
      background: var(--gl-danger);
    }
    :host([status="success"]) .indicator-dot {
      background: var(--gl-success);
    }
    :host([status="info"]) .indicator-dot {
      background: #3b82f6;
    }
    :host([variant="square"]) .indicator-dot {
      border-radius: var(--gl-radius-sm);
    }
    :host([variant="badge"]) .indicator-dot {
      border: 2px solid var(--gl-panel);
      box-shadow: 0 0 0 1px var(--gl-border);
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    @keyframes pulse-ring {
      0% {
        transform: scale(1);
        opacity: 0.5;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  </style>
  <div class="indicator" part="indicator">
    <div class="indicator-dot" part="dot"></div>
    <span class="indicator-label" part="label">
      <slot></slot>
    </span>
  </div>
`;

export class GlStatusIndicator extends HTMLElement {
  static tagName = "gl-status-indicator";
  static get observedAttributes() {
    return ["status", "size", "variant", "pulse", "label"];
  }

  #dot!: HTMLElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#dot = this.shadowRoot!.querySelector(".indicator-dot") as HTMLElement;
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#dot) return;
    
    const pulse = this.hasAttribute("pulse");
    if (pulse) {
      this.#dot.setAttribute("data-pulse", "");
    } else {
      this.#dot.removeAttribute("data-pulse");
    }

    const label = this.getAttribute("label");
    const labelEl = this.shadowRoot!.querySelector(".indicator-label") as HTMLElement;
    if (label) {
      labelEl.textContent = label;
    } else if (!this.textContent.trim()) {
      labelEl.style.display = "none";
    } else {
      labelEl.style.display = "inline";
    }
  }

  get status() {
    return this.getAttribute("status") || "online";
  }

  set status(v: string) {
    this.setAttribute("status", v);
  }

  get size() {
    return this.getAttribute("size") || "md";
  }

  set size(v: string) {
    this.setAttribute("size", v);
  }

  get variant() {
    return this.getAttribute("variant") || "default";
  }

  set variant(v: string) {
    this.setAttribute("variant", v);
  }

  get pulse() {
    return this.hasAttribute("pulse");
  }

  set pulse(v: boolean) {
    if (v) this.setAttribute("pulse", "");
    else this.removeAttribute("pulse");
  }
}
