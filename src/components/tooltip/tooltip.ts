const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block;position:relative}
    .tip{
      position:absolute;
      left:50%;
      transform:translate(-50%, -6px);
      bottom:100%;
      z-index:var(--gl-z-tooltip);
      background:color-mix(in srgb, var(--gl-fg) 92%, transparent);
      color:color-mix(in srgb, var(--gl-bg) 92%, transparent);
      border-radius:10px;
      padding:8px 10px;
      font-size:var(--gl-text-sm);
      line-height:var(--gl-line-sm);
      box-shadow:var(--gl-shadow-md);
      opacity:0;
      pointer-events:none;
      transition:opacity var(--gl-dur-1) var(--gl-ease), transform var(--gl-dur-1) var(--gl-ease);
      white-space:nowrap;
      max-width:min(280px, 80vw);
      text-overflow:ellipsis;
      overflow:hidden;
    }
    :host([open]) .tip{opacity:1; transform:translate(-50%, -10px)}
    .arrow{
      position:absolute;
      left:50%;
      transform:translateX(-50%);
      top:100%;
      width:10px;height:10px;
      background:color-mix(in srgb, var(--gl-fg) 92%, transparent);
      rotate:45deg;
    }
    .trigger{display:inline-flex}
  </style>
  <span class="trigger" part="trigger"><slot></slot></span>
  <div class="tip" part="tooltip" role="tooltip">
    <slot name="content"></slot>
    <span class="arrow" part="arrow" aria-hidden="true"></span>
  </div>
`;

export class GlTooltip extends HTMLElement {
  static tagName = "gl-tooltip";
  static get observedAttributes() {
    return ["open", "disabled"];
  }

  #trigger!: HTMLElement;
  #tip!: HTMLElement;
  #id = `gl-tip-${Math.random().toString(16).slice(2)}`;
  #openTimer: number | null = null;
  #closeTimer: number | null = null;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#trigger = this.shadowRoot!.querySelector(".trigger") as HTMLElement;
    this.#tip = this.shadowRoot!.querySelector(".tip") as HTMLElement;
    this.#tip.id = this.#id;

    this.#trigger.addEventListener("mouseenter", () => this.#scheduleOpen());
    this.#trigger.addEventListener("mouseleave", () => this.#scheduleClose());
    this.#trigger.addEventListener("focusin", () => this.open());
    this.#trigger.addEventListener("focusout", () => this.close());
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });

    this.#sync();
  }

  disconnectedCallback() {
    if (this.#openTimer) window.clearTimeout(this.#openTimer);
    if (this.#closeTimer) window.clearTimeout(this.#closeTimer);
  }

  attributeChangedCallback() {
    this.#sync();
  }

  open() {
    if (this.hasAttribute("disabled")) return;
    this.setAttribute("open", "");
  }

  close() {
    this.removeAttribute("open");
  }

  #scheduleOpen() {
    if (this.hasAttribute("disabled")) return;
    if (this.#closeTimer) window.clearTimeout(this.#closeTimer);
    this.#openTimer = window.setTimeout(() => this.open(), 120);
  }

  #scheduleClose() {
    if (this.#openTimer) window.clearTimeout(this.#openTimer);
    this.#closeTimer = window.setTimeout(() => this.close(), 80);
  }

  #sync() {
    const open = this.hasAttribute("open");
    if (open) this.#trigger?.setAttribute("aria-describedby", this.#id);
    else this.#trigger?.removeAttribute("aria-describedby");
  }
}


