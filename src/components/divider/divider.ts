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
    .wrapper{
      display:flex;
      align-items:center;
      gap:var(--gl-space-3);
      margin:var(--gl-space-4) 0;
    }
    .wrapper::before,
    .wrapper::after{
      content:"";
      flex:1;
      height:1px;
      background:var(--gl-border);
    }
    .text{
      font-size:var(--gl-text-sm);
      line-height:var(--gl-line-sm);
      color:var(--gl-muted);
      white-space:nowrap;
    }
    :host([orientation="vertical"]) .wrapper{
      flex-direction:column;
      margin:0 var(--gl-space-4);
    }
    :host([orientation="vertical"]) .wrapper::before,
    :host([orientation="vertical"]) .wrapper::after{
      width:1px;
      height:auto;
      flex:1;
    }
  </style>
  <slot name="text">
    <hr part="divider" class="divider" />
  </slot>
`;

export class GlDivider extends HTMLElement {
  static tagName = "gl-divider";
  static get observedAttributes() {
    return ["orientation"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) {
      root.appendChild(template.content.cloneNode(true));
      this.#update();
    }
  }

  attributeChangedCallback() {
    this.#update();
  }

  #update() {
    if (!this.shadowRoot) return;
    const hasText = this.querySelector('[slot="text"]') !== null;
    const divider = this.shadowRoot.querySelector(".divider");
    const wrapper = this.shadowRoot.querySelector(".wrapper");
    
    if (hasText && !wrapper) {
      const w = document.createElement("div");
      w.className = "wrapper";
      w.innerHTML = '<div class="text" part="text"><slot name="text"></slot></div>';
      if (divider) divider.remove();
      this.shadowRoot.appendChild(w);
    } else if (!hasText && wrapper) {
      wrapper.remove();
      if (!divider) {
        const d = document.createElement("hr");
        d.className = "divider";
        d.setAttribute("part", "divider");
        this.shadowRoot.appendChild(d);
      }
    }
  }
}
