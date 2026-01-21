const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block}
    .badge{
      display:inline-flex;
      align-items:center;
      gap:var(--gl-space-1);
      padding:4px 10px;
      border-radius:12px;
      font-size:var(--gl-text-sm);
      line-height:var(--gl-line-sm);
      font-weight:500;
      background:var(--gl-primary);
      color:var(--gl-primary-fg);
      box-shadow:var(--gl-shadow-sm);
      border:1px solid transparent;
      transition:transform var(--gl-dur-1) var(--gl-ease), box-shadow var(--gl-dur-1) var(--gl-ease);
    }
    :host(:not([motion="none"])) .badge{
      opacity:0;
      transform:scale(0.8);
      animation:gl-scale-in var(--gl-scale-in-dur) var(--gl-ease-spring) forwards;
      animation-delay:0s;
    }
    :host([motion="subtle"]:hover) .badge{transform:translateY(-1px);box-shadow:var(--gl-shadow-md)}
    :host([motion="snappy"]:hover) .badge{transform:translateY(-2px) scale(1.05);box-shadow:var(--gl-shadow-md)}
    :host([variant="secondary"]) .badge{
      background:var(--gl-panel);
      color:var(--gl-fg);
      border-color:var(--gl-border);
    }
    :host([variant="outline"]) .badge{
      background:transparent;
      color:var(--gl-fg);
      border-color:var(--gl-border);
    }
    :host([variant="destructive"]) .badge{
      background:var(--gl-danger);
      color:var(--gl-danger-fg);
    }
    :host([size="sm"]) .badge{padding:2px 8px;font-size:11px;line-height:14px}
    :host([size="lg"]) .badge{padding:6px 12px;font-size:var(--gl-text-md);line-height:var(--gl-line-md)}
  </style>
  <span part="badge" class="badge"><slot></slot></span>
`;

export class GlBadge extends HTMLElement {
  static tagName = "gl-badge";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }
}
