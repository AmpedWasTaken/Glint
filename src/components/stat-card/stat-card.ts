const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .stat-card {
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      padding: var(--gl-space-4);
      display: flex;
      flex-direction: column;
      gap: var(--gl-space-3);
      transition: all var(--gl-dur-1) var(--gl-ease);
      position: relative;
      overflow: hidden;
    }
    .stat-card:hover {
      box-shadow: var(--gl-shadow-md);
      transform: translateY(-2px);
    }
    .stat-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--gl-space-2);
    }
    .stat-card-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--gl-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-card-content {
      flex: 1;
      min-width: 0;
    }
    .stat-card-label {
      font-size: var(--gl-text-sm);
      color: var(--gl-muted);
      margin: 0 0 var(--gl-space-1);
      font-weight: 500;
    }
    .stat-card-value {
      font-size: var(--gl-text-3xl);
      font-weight: 700;
      line-height: 1;
      color: var(--gl-fg);
      margin: 0;
      font-variant-numeric: tabular-nums;
    }
    .stat-card-change {
      font-size: var(--gl-text-sm);
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: var(--gl-space-1);
      margin-top: var(--gl-space-2);
    }
    .stat-card-change[data-positive] {
      color: var(--gl-success);
    }
    .stat-card-change[data-negative] {
      color: var(--gl-danger);
    }
    .stat-card-change[data-neutral] {
      color: var(--gl-muted);
    }
    .stat-card-description {
      font-size: var(--gl-text-sm);
      color: var(--gl-muted);
      margin: var(--gl-space-2) 0 0;
      line-height: var(--gl-line-sm);
    }
    :host([variant="default"]) .stat-card-icon {
      background: color-mix(in srgb, var(--gl-primary) 15%, transparent);
      color: var(--gl-primary);
    }
    :host([variant="success"]) .stat-card-icon {
      background: color-mix(in srgb, var(--gl-success) 15%, transparent);
      color: var(--gl-success);
    }
    :host([variant="warning"]) .stat-card-icon {
      background: color-mix(in srgb, #f59e0b 15%, transparent);
      color: #f59e0b;
    }
    :host([variant="destructive"]) .stat-card-icon {
      background: color-mix(in srgb, var(--gl-danger) 15%, transparent);
      color: var(--gl-danger);
    }
    :host([variant="info"]) .stat-card-icon {
      background: color-mix(in srgb, #3b82f6 15%, transparent);
      color: #3b82f6;
    }
    :host([size="sm"]) .stat-card {
      padding: var(--gl-space-3);
    }
    :host([size="sm"]) .stat-card-icon {
      width: 32px;
      height: 32px;
    }
    :host([size="sm"]) .stat-card-value {
      font-size: var(--gl-text-2xl);
    }
    :host([size="lg"]) .stat-card {
      padding: var(--gl-space-5);
    }
    :host([size="lg"]) .stat-card-icon {
      width: 48px;
      height: 48px;
    }
    :host([size="lg"]) .stat-card-value {
      font-size: var(--gl-text-4xl);
    }
    :host([trend="up"]) .stat-card {
      border-top: 3px solid var(--gl-success);
    }
    :host([trend="down"]) .stat-card {
      border-top: 3px solid var(--gl-danger);
    }
    :host([trend="neutral"]) .stat-card {
      border-top: 3px solid var(--gl-muted);
    }
  </style>
  <div class="stat-card" part="stat-card">
    <div class="stat-card-header" part="header">
      <div class="stat-card-content" part="content">
        <div class="stat-card-label" part="label">
          <slot name="label"></slot>
        </div>
        <div class="stat-card-value" part="value">
          <slot name="value"></slot>
        </div>
        <div class="stat-card-change" part="change">
          <slot name="change"></slot>
        </div>
        <div class="stat-card-description" part="description">
          <slot></slot>
        </div>
      </div>
      <div class="stat-card-icon" part="icon">
        <slot name="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </slot>
      </div>
    </div>
  </div>
`;

export class GlStatCard extends HTMLElement {
  static tagName = "gl-stat-card";
  static get observedAttributes() {
    return ["variant", "size", "trend", "change"];
  }

  #changeEl!: HTMLElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#changeEl = this.shadowRoot!.querySelector(".stat-card-change") as HTMLElement;
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#changeEl) return;

    const change = this.getAttribute("change");
    if (change) {
      const numChange = parseFloat(change);
      if (numChange > 0) {
        this.#changeEl.setAttribute("data-positive", "");
        this.#changeEl.removeAttribute("data-negative");
        this.#changeEl.removeAttribute("data-neutral");
      } else if (numChange < 0) {
        this.#changeEl.setAttribute("data-negative", "");
        this.#changeEl.removeAttribute("data-positive");
        this.#changeEl.removeAttribute("data-neutral");
      } else {
        this.#changeEl.setAttribute("data-neutral", "");
        this.#changeEl.removeAttribute("data-positive");
        this.#changeEl.removeAttribute("data-negative");
      }
    } else {
      this.#changeEl.removeAttribute("data-positive");
      this.#changeEl.removeAttribute("data-negative");
      this.#changeEl.removeAttribute("data-neutral");
    }
  }

  get variant() {
    return this.getAttribute("variant") || "default";
  }

  set variant(v: string) {
    this.setAttribute("variant", v);
  }

  get size() {
    return this.getAttribute("size") || "md";
  }

  set size(v: string) {
    this.setAttribute("size", v);
  }

  get trend() {
    return this.getAttribute("trend") || "";
  }

  set trend(v: string) {
    this.setAttribute("trend", v);
  }

  get change() {
    return this.getAttribute("change") || "";
  }

  set change(v: string) {
    this.setAttribute("change", v);
  }
}
