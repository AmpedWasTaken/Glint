const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    .card{
      background:var(--gl-panel);
      color:var(--gl-fg);
      border:1px solid var(--gl-border);
      border-radius:var(--gl-radius);
      box-shadow:var(--gl-shadow-sm);
      overflow:hidden;
      transition:box-shadow var(--gl-dur-2) var(--gl-ease), transform var(--gl-dur-2) var(--gl-ease), border-color var(--gl-dur-1) var(--gl-ease);
    }
    :host([motion="subtle"]:hover) .card{box-shadow:var(--gl-shadow-md);transform:translateY(-2px)}
    :host([motion="snappy"]:hover) .card{box-shadow:var(--gl-shadow-lg);transform:translateY(-4px) scale(1.01)}
    :host([motion="bounce"]:hover) .card{box-shadow:var(--gl-shadow-lg);transform:translateY(-3px)}
    .header{padding:var(--gl-space-4) var(--gl-space-4) 0}
    .body{padding:var(--gl-space-4)}
    .footer{padding:0 var(--gl-space-4) var(--gl-space-4)}
    .header:empty,.footer:empty{display:none}
    ::slotted([slot="title"]){font-size:var(--gl-text-lg);line-height:var(--gl-line-lg);font-weight:600;margin:0}
    ::slotted([slot="description"]){color:var(--gl-muted);font-size:var(--gl-text-md);line-height:var(--gl-line-md);margin:0}
  </style>
  <div part="card" class="card">
    <div part="header" class="header"><slot name="header"></slot></div>
    <div part="body" class="body"><slot></slot></div>
    <div part="footer" class="footer"><slot name="footer"></slot></div>
  </div>
`;

export class GlCard extends HTMLElement {
  static tagName = "gl-card";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }
}
