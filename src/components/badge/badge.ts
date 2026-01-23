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
      opacity:1;
      transform:none;
      transition:
        opacity var(--gl-dur-2) var(--gl-ease-out),
        transform var(--gl-dur-2) var(--gl-ease-out),
        box-shadow var(--gl-dur-1) var(--gl-ease);
    }
    :host([data-enter]) .badge{opacity:0;transform:scale(0.8)}
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
    :host([variant="success"]) .badge{
      background:var(--gl-success);
      color:var(--gl-success-fg);
    }
    :host([variant="warning"]) .badge{
      background:#f59e0b;
      color:#fff;
    }
    :host([variant="dot"]) .badge{
      padding:0;
      width:8px;
      height:8px;
      border-radius:50%;
      min-width:8px;
    }
    :host([variant="dot"][size="sm"]) .badge{width:6px;height:6px;min-width:6px}
    :host([variant="dot"][size="lg"]) .badge{width:10px;height:10px;min-width:10px}
    :host([variant="pulse"]) .badge{
      position:relative;
      animation:gl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    :host([variant="pulse"]) .badge::before{
      content:"";
      position:absolute;
      inset:-2px;
      border-radius:inherit;
      background:inherit;
      opacity:0.4;
      animation:gl-pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes gl-pulse{
      0%,100%{opacity:1}
      50%{opacity:0.7}
    }
    @keyframes gl-pulse-ring{
      0%{transform:scale(1);opacity:0.4}
      100%{transform:scale(1.5);opacity:0}
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
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) root.appendChild(template.content.cloneNode(true));

    const animate = this.getAttribute("motion") !== "none";
    if (animate) {
      this.setAttribute("data-enter", "");
      requestAnimationFrame(() => this.removeAttribute("data-enter"));
    } else {
      this.removeAttribute("data-enter");
    }
  }
}
