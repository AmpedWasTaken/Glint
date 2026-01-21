const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block}
    .spinner{
      width:20px;
      height:20px;
      border:2px solid var(--gl-border);
      border-top-color:var(--gl-primary);
      border-radius:50%;
      animation:spin var(--gl-dur-5) linear infinite;
    }
    @keyframes spin{to{transform:rotate(360deg)}}
    :host([size="sm"]) .spinner{width:16px;height:16px;border-width:2px}
    :host([size="lg"]) .spinner{width:28px;height:28px;border-width:3px}
    :host([variant="destructive"]) .spinner{border-top-color:var(--gl-danger)}
    @media (prefers-reduced-motion: reduce) {
      .spinner{animation:none;border-top-color:var(--gl-primary)}
    }
  </style>
  <div part="spinner" class="spinner" role="status" aria-label="Loading"></div>
`;

export class GlSpinner extends HTMLElement {
  static tagName = "gl-spinner";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }
}
