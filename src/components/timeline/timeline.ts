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
      padding-left: 24px;
    }
    :host([variant="horizontal"]) .timeline {
      flex-direction: row;
      padding-left: 0;
      padding-top: 24px;
    }
    .line {
      position: absolute;
      left: 11px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--gl-border);
      z-index: 0;
    }
    :host([variant="horizontal"]) .line {
      left: 0;
      right: 0;
      top: 11px;
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
      padding-bottom: var(--gl-space-6);
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
      left: -24px;
      top: 4px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--gl-panel);
      border: 2px solid var(--gl-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 2;
      transition: all var(--gl-dur-2) var(--gl-ease);
    }
    :host([variant="horizontal"]) .indicator {
      left: 50%;
      top: -24px;
      transform: translateX(-50%);
    }
    :host([state="active"]) .indicator {
      background: var(--gl-primary);
      border-color: var(--gl-primary);
      box-shadow: 0 0 0 4px rgba(var(--gl-primary-rgb), 0.1);
    }
    :host([state="active"]) .indicator::after {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--gl-primary-fg);
    }
    :host([state="completed"]) .indicator {
      background: var(--gl-primary);
      border-color: var(--gl-primary);
    }
    :host([state="completed"]) .indicator::after {
      content: "✓";
      color: var(--gl-primary-fg);
      font-size: 12px;
      font-weight: 600;
    }
    :host([state="error"]) .indicator {
      background: var(--gl-destructive);
      border-color: var(--gl-destructive);
    }
    :host([state="error"]) .indicator::after {
      content: "✕";
      color: var(--gl-destructive-fg);
      font-size: 12px;
      font-weight: 600;
    }
    .icon {
      display: none;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      font-size: 12px;
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
    }
    .header {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
      margin-bottom: var(--gl-space-1);
    }
    .title {
      font-size: var(--gl-text-base);
      font-weight: 600;
      color: var(--gl-fg);
      line-height: var(--gl-line-base);
    }
    .timestamp {
      font-size: var(--gl-text-sm);
      color: var(--gl-muted);
      line-height: var(--gl-line-sm);
    }
    .description {
      font-size: var(--gl-text-sm);
      color: var(--gl-muted);
      line-height: var(--gl-line-sm);
      margin-top: var(--gl-space-1);
    }
    :host([variant="horizontal"]) .item {
      flex-direction: column;
      text-align: center;
      padding-top: 32px;
    }
    :host([variant="horizontal"]) .content {
      width: 100%;
    }
    :host([variant="horizontal"]) .header {
      flex-direction: column;
      align-items: center;
      gap: var(--gl-space-1);
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
        <slot name="title">
          <span part="title" class="title"></span>
        </slot>
        <slot name="timestamp">
          <span part="timestamp" class="timestamp"></span>
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

