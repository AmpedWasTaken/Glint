import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      text-align: center;
      padding: var(--gl-space-8) var(--gl-space-4);
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gl-space-4);
      max-width: 400px;
      margin: 0 auto;
    }
    .icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--gl-hover);
      color: var(--gl-muted);
      font-size: 32px;
      margin-bottom: var(--gl-space-2);
      transition: all var(--gl-dur-2) var(--gl-ease-out);
    }
    :host([variant="minimal"]) .icon {
      width: 48px;
      height: 48px;
      font-size: 24px;
    }
    :host([variant="large"]) .icon {
      width: 96px;
      height: 96px;
      font-size: 48px;
    }
    .title {
      font-size: var(--gl-text-lg);
      font-weight: 600;
      color: var(--gl-fg);
      margin: 0;
    }
    .description {
      font-size: var(--gl-text-md);
      color: var(--gl-muted);
      line-height: var(--gl-line-md);
      margin: 0;
    }
    .actions {
      display: flex;
      gap: var(--gl-space-2);
      margin-top: var(--gl-space-2);
      flex-wrap: wrap;
      justify-content: center;
    }
    :host([variant="minimal"]) .title {
      font-size: var(--gl-text-md);
    }
    :host([variant="large"]) .title {
      font-size: var(--gl-text-xl);
    }
  </style>
  <div class="container" part="container">
    <div class="icon" part="icon">
      <slot name="icon">📭</slot>
    </div>
    <h3 class="title" part="title">
      <slot name="title">No items found</slot>
    </h3>
    <p class="description" part="description">
      <slot name="description">Get started by creating a new item.</slot>
    </p>
    <div class="actions" part="actions">
      <slot name="actions"></slot>
    </div>
  </div>
`;

export class GlEmptyState extends HTMLElement {
  static tagName = "gl-empty-state";
  static get observedAttributes() {
    return ["variant"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }

  attributeChangedCallback() {
    // Handle variant changes if needed
  }
}

