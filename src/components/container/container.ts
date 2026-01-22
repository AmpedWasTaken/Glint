const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      padding-left: var(--gl-space-4);
      padding-right: var(--gl-space-4);
    }
    :host([size="sm"]) {
      max-width: 640px;
    }
    :host([size="md"]) {
      max-width: 768px;
    }
    :host([size="lg"]) {
      max-width: 1024px;
    }
    :host([size="xl"]) {
      max-width: 1280px;
    }
    :host([size="2xl"]) {
      max-width: 1536px;
    }
    :host([size="full"]) {
      max-width: 100%;
    }
    :host([fluid]) {
      max-width: 100%;
    }
    :host([centered]) {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    :host([padding="none"]) {
      padding-left: 0;
      padding-right: 0;
    }
    :host([padding="sm"]) {
      padding-left: var(--gl-space-2);
      padding-right: var(--gl-space-2);
    }
    :host([padding="md"]) {
      padding-left: var(--gl-space-4);
      padding-right: var(--gl-space-4);
    }
    :host([padding="lg"]) {
      padding-left: var(--gl-space-6);
      padding-right: var(--gl-space-6);
    }
    :host([padding="xl"]) {
      padding-left: var(--gl-space-8);
      padding-right: var(--gl-space-8);
    }
    @media (max-width: 640px) {
      :host {
        padding-left: var(--gl-space-3);
        padding-right: var(--gl-space-3);
      }
      :host([padding="none"]) {
        padding-left: 0;
        padding-right: 0;
      }
    }
  </style>
  <slot></slot>
`;

export class GlContainer extends HTMLElement {
  static tagName = "gl-container";
  static get observedAttributes() {
    return ["size", "fluid", "centered", "padding"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }
}

