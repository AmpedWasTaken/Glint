const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block;width:100%}
    .divider{
      height:1px;
      background:var(--gl-border);
      border:none;
      margin:var(--gl-space-4) 0;
    }
    :host([orientation="vertical"]){display:inline-block;width:auto;height:100%}
    :host([orientation="vertical"]) .divider{
      width:1px;
      height:100%;
      margin:0 var(--gl-space-4);
    }
  </style>
  <hr part="divider" class="divider" />
`;

export class GlDivider extends HTMLElement {
  static tagName = "gl-divider";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }
}
