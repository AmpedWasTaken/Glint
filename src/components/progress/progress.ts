const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    .track{
      width:100%;
      height:8px;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:12px;
      overflow:hidden;
      box-shadow:inset 0 1px 2px rgba(0,0,0,0.05);
    }
    .bar{
      height:100%;
      background:var(--gl-primary);
      border-radius:12px;
      width:0%;
      transition:width var(--gl-dur-3) var(--gl-ease-out);
      box-shadow:0 1px 2px rgba(0,0,0,0.1);
    }
    :host([motion="snappy"]) .bar{transition:width var(--gl-dur-2) var(--gl-ease-spring)}
    :host([motion="bounce"]) .bar{transition:width var(--gl-dur-3) var(--gl-ease-bounce)}
    :host([size="sm"]) .track{height:4px}
    :host([size="lg"]) .track{height:12px}
    :host([variant="destructive"]) .bar{background:var(--gl-danger)}
    :host([variant="success"]) .bar{background:var(--gl-success)}
    :host([variant="warning"]) .bar{background:#f59e0b}
    .label{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:var(--gl-space-2);
      font-size:var(--gl-text-sm);
      line-height:var(--gl-line-sm);
      color:var(--gl-muted);
    }
    .value{font-weight:600;color:var(--gl-fg)}
  </style>
  <div class="label" part="label" style="display:none">
    <span part="label-text"><slot name="label"></slot></span>
    <span class="value" part="value"></span>
  </div>
  <div part="track" class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div part="bar" class="bar"></div>
  </div>
`;

export class GlProgress extends HTMLElement {
  static tagName = "gl-progress";
  static get observedAttributes() {
    return ["value", "size", "variant", "show-label"];
  }

  #track!: HTMLElement;
  #bar!: HTMLElement;
  #label!: HTMLElement;
  #value!: HTMLElement;

  get value() {
    const v = Number(this.getAttribute("value") ?? "0");
    return Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
  }
  set value(v: number) {
    this.setAttribute("value", String(Math.max(0, Math.min(100, v))));
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#track = this.shadowRoot!.querySelector(".track") as HTMLElement;
    this.#bar = this.shadowRoot!.querySelector(".bar") as HTMLElement;
    this.#label = this.shadowRoot!.querySelector(".label") as HTMLElement;
    this.#value = this.shadowRoot!.querySelector(".value") as HTMLElement;
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#track || !this.#bar) return;
    const v = this.value;
    this.#bar.style.width = `${v}%`;
    this.#track.setAttribute("aria-valuenow", String(v));
    if (this.#value) this.#value.textContent = `${Math.round(v)}%`;
    if (this.#label && this.hasAttribute("show-label")) {
      this.#label.style.display = "flex";
    } else if (this.#label) {
      this.#label.style.display = "none";
    }
  }
}
