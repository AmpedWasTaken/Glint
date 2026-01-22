const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
      position: relative;
    }
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      padding-left: 32px;
    }
    :host([variant="horizontal"]) .timeline {
      flex-direction: row;
      padding-left: 0;
      padding-top: 32px;
    }
    .line {
      position: absolute;
      left: 0px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--gl-border);
      z-index: 0;
      border-radius: 1px;
    }
    :host([variant="horizontal"]) .line {
      left: 0;
      right: 0;
      top: 15px;
      bottom: auto;
      width: auto;
      height: 2px;
    }
    ::slotted(gl-timeline-item) {
      position: relative;
      z-index: 1;
      display: block;
    }
    :host([variant="horizontal"]) ::slotted(gl-timeline-item) {
      flex: 1;
      min-width: 0;
    }
  </style>
  <div part="timeline" class="timeline">
    <div part="line" class="line"></div>
    <slot></slot>
  </div>
`;

export class GlTimeline extends HTMLElement {
  static tagName = "gl-timeline";
  static get observedAttributes() {
    return ["variant"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) {
      root.appendChild(template.content.cloneNode(true));
    }
  }

  attributeChangedCallback() {
    // Variant changes are handled by CSS
  }
}

const itemTemplate = document.createElement("template");
itemTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
      padding-bottom: var(--gl-space-12);
    }
    :host(:last-child) {
      padding-bottom: 0;
    }
    .item {
      display: flex;
      gap: var(--gl-space-4);
      align-items: flex-start;
    }
    .indicator {
      position: absolute;
      left: -32px;
      top: 15px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--gl-panel);
      border: 2px solid var(--gl-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 2;
      transition: all var(--gl-dur-2) var(--gl-ease);
      box-shadow: var(--gl-shadow-sm);
      transform: translateX(-50%);
    }
    :host([variant="horizontal"]) .indicator {
      left: 50%;
      top: -32px;
      transform: translateX(-50%);
    }
    :host([state="active"]) .indicator {
      background: var(--gl-primary);
      border-color: var(--gl-primary);
      box-shadow: 0 0 0 4px rgba(var(--gl-primary-rgb), 0.1), var(--gl-shadow-sm);
    }
    :host([state="active"]) .indicator::after {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--gl-primary-fg);
    }
    :host([state="completed"]) .indicator {
      background: var(--gl-primary);
      border-color: var(--gl-primary);
      box-shadow: var(--gl-shadow-sm);
    }
    :host([state="completed"]) .indicator::after {
      content: "✓";
      color: var(--gl-primary-fg);
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
    }
    :host([state="error"]) .indicator {
      background: var(--gl-destructive);
      border-color: var(--gl-destructive);
      box-shadow: var(--gl-shadow-sm);
    }
    :host([state="error"]) .indicator::after {
      content: "✕";
      color: var(--gl-destructive-fg);
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
    }
    .icon {
      display: none;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
    :host([icon]) .icon {
      display: flex;
    }
    :host([icon]) .indicator::after {
      display: none;
    }
    .content {
      flex: 1;
      min-width: 0;
      padding-top: 0px;
      display: flex;
      flex-direction: column;
      gap: var(--gl-space-1);
    }
    .header {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .timestamp {
      font-size: 11px !important;
      color: var(--gl-muted) !important;
      line-height: 14px !important;
      font-weight: 400 !important;
      order: 1;
      letter-spacing: 0.01em;
      opacity: 0.7 !important;
    }
    ::slotted([slot="timestamp"]) {
      font-size: 11px !important;
      color: var(--gl-muted) !important;
      line-height: 14px !important;
      font-weight: 400 !important;
      opacity: 0.7 !important;
    }
    .title {
      font-size: var(--gl-text-lg) !important;
      font-weight: 600 !important;
      color: var(--gl-fg) !important;
      line-height: var(--gl-line-lg) !important;
      order: 2;
    }
    ::slotted([slot="title"]) {
      font-size: var(--gl-text-lg) !important;
      font-weight: 600 !important;
      color: var(--gl-fg) !important;
      line-height: var(--gl-line-lg) !important;
    }
    .description {
      font-size: var(--gl-text-sm) !important;
      color: color-mix(in srgb, var(--gl-muted) 85%, transparent) !important;
      line-height: var(--gl-line-sm) !important;
      margin-top: 0;
      padding-top: 0;
      order: 3;
    }
    ::slotted([slot="description"]) {
      font-size: var(--gl-text-sm) !important;
      color: color-mix(in srgb, var(--gl-muted) 85%, transparent) !important;
      line-height: var(--gl-line-sm) !important;
      margin-top: 0;
    }
    :host([variant="horizontal"]) .item {
      flex-direction: column;
      text-align: center;
      padding-top: 40px;
    }
    :host([variant="horizontal"]) .content {
      width: 100%;
      padding-top: 0;
    }
    :host([variant="horizontal"]) .header {
      flex-direction: column;
      align-items: center;
      gap: var(--gl-space-1);
    }
    :host([variant="horizontal"]) .timestamp {
      order: 1;
    }
    :host([variant="horizontal"]) .title {
      order: 2;
    }
    :host([variant="horizontal"]) .description {
      order: 3;
    }
  </style>
  <div part="item" class="item">
    <div part="indicator" class="indicator">
      <slot name="icon">
        <span part="icon" class="icon"></span>
      </slot>
    </div>
    <div part="content" class="content">
      <div part="header" class="header">
        <slot name="timestamp">
          <span part="timestamp" class="timestamp"></span>
        </slot>
        <slot name="title">
          <span part="title" class="title"></span>
        </slot>
      </div>
      <slot name="description">
        <div part="description" class="description"></div>
      </slot>
      <slot></slot>
    </div>
  </div>
`;

export class GlTimelineItem extends HTMLElement {
  static tagName = "gl-timeline-item";
  static get observedAttributes() {
    return ["state", "icon", "variant"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) {
      root.appendChild(itemTemplate.content.cloneNode(true));
      this.#update();
    }
  }

  attributeChangedCallback() {
    this.#update();
  }

  #update() {
    if (!this.shadowRoot) return;
    const parent = this.closest("gl-timeline");
    const variant = parent?.getAttribute("variant") || "vertical";
    if (variant !== this.getAttribute("variant")) {
      this.setAttribute("variant", variant);
    }
  }
}

