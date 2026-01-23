const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block;position:relative}
    .tip{
      position:fixed;
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
      white-space:nowrap;
      max-width:min(280px, 80vw);
      text-overflow:ellipsis;
      overflow:hidden;
      transform:translate(-50%, -6px);
    }
    :host([side="top"]) .tip{
      bottom:100%;
      left:50%;
      transform:translate(-50%, -6px);
    }
    :host([side="bottom"]) .tip{
      top:100%;
      left:50%;
      transform:translate(-50%, 6px);
    }
    :host([side="left"]) .tip{
      right:100%;
      top:50%;
      transform:translate(-6px, -50%);
    }
    :host([side="right"]) .tip{
      left:100%;
      top:50%;
      transform:translate(6px, -50%);
    }
    :host([side="top"][align="start"]) .tip{left:0;transform:translateY(-6px)}
    :host([side="top"][align="end"]) .tip{left:auto;right:0;transform:translateY(-6px)}
    :host([side="bottom"][align="start"]) .tip{left:0;transform:translateY(6px)}
    :host([side="bottom"][align="end"]) .tip{left:auto;right:0;transform:translateY(6px)}
    :host([side="left"][align="start"]) .tip{top:0;transform:translateX(-6px)}
    :host([side="left"][align="end"]) .tip{top:auto;bottom:0;transform:translateX(-6px)}
    :host([side="right"][align="start"]) .tip{top:0;transform:translateX(6px)}
    :host([side="right"][align="end"]) .tip{top:auto;bottom:0;transform:translateX(6px)}
    :host([motion="none"]) .tip{transition:none}
    :host([motion="subtle"]) .tip{transition:opacity var(--gl-dur-2) var(--gl-ease-out), transform var(--gl-dur-2) var(--gl-ease-out)}
    :host([motion="snappy"]) .tip{transition:opacity var(--gl-dur-1) var(--gl-ease-spring), transform var(--gl-dur-1) var(--gl-ease-spring)}
    :host([motion="bounce"]) .tip{transition:opacity var(--gl-dur-2) var(--gl-ease-bounce), transform var(--gl-dur-2) var(--gl-ease-bounce)}
    :host(:not([motion])) .tip{transition:opacity var(--gl-dur-1) var(--gl-ease), transform var(--gl-dur-1) var(--gl-ease)}
    :host([side="top"][open]) .tip{opacity:1; transform:translate(-50%, -10px)}
    :host([side="top"][motion="snappy"][open]) .tip{transform:translate(-50%, -12px)}
    :host([side="top"][motion="bounce"][open]) .tip{transform:translate(-50%, -14px) scale(1.05)}
    :host([side="bottom"][open]) .tip{opacity:1; transform:translate(-50%, 10px)}
    :host([side="bottom"][motion="snappy"][open]) .tip{transform:translate(-50%, 12px)}
    :host([side="bottom"][motion="bounce"][open]) .tip{transform:translate(-50%, 14px) scale(1.05)}
    :host([side="left"][open]) .tip{opacity:1; transform:translate(-10px, -50%)}
    :host([side="left"][motion="snappy"][open]) .tip{transform:translate(-12px, -50%)}
    :host([side="left"][motion="bounce"][open]) .tip{transform:translate(-14px, -50%) scale(1.05)}
    :host([side="right"][open]) .tip{opacity:1; transform:translate(10px, -50%)}
    :host([side="right"][motion="snappy"][open]) .tip{transform:translate(12px, -50%)}
    :host([side="right"][motion="bounce"][open]) .tip{transform:translate(14px, -50%) scale(1.05)}
    :host(:not([side])[open]) .tip{opacity:1; transform:translate(-50%, -10px)}
    :host(:not([side])[motion="snappy"][open]) .tip{transform:translate(-50%, -12px)}
    :host(:not([side])[motion="bounce"][open]) .tip{transform:translate(-50%, -14px) scale(1.05)}
    .arrow{
      position:absolute;
      width:10px;height:10px;
      background:color-mix(in srgb, var(--gl-fg) 92%, transparent);
      rotate:45deg;
    }
    :host([side="top"]) .arrow{
      left:50%;
      transform:translateX(-50%);
      top:100%;
      margin-top:-5px;
    }
    :host([side="bottom"]) .arrow{
      left:50%;
      transform:translateX(-50%);
      bottom:100%;
      margin-bottom:-5px;
    }
    :host([side="left"]) .arrow{
      top:50%;
      transform:translateY(-50%);
      left:100%;
      margin-left:-5px;
    }
    :host([side="right"]) .arrow{
      top:50%;
      transform:translateY(-50%);
      right:100%;
      margin-right:-5px;
    }
    :host(:not([side])) .arrow{
      left:50%;
      transform:translateX(-50%);
      top:100%;
      margin-top:-5px;
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
    return ["open", "disabled", "side", "align"];
  }

  #trigger!: HTMLElement;
  #tip!: HTMLElement;
  #id = `gl-tip-${Math.random().toString(16).slice(2)}`;
  #openTimer: number | null = null;
  #closeTimer: number | null = null;
  #onReposition?: () => void;

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

    this.#onReposition = () => {
      if (this.hasAttribute("open")) this.#position();
    };
    window.addEventListener("resize", this.#onReposition, { passive: true });
    window.addEventListener("scroll", this.#onReposition, { passive: true });

    this.#sync();
  }

  disconnectedCallback() {
    if (this.#openTimer) window.clearTimeout(this.#openTimer);
    if (this.#closeTimer) window.clearTimeout(this.#closeTimer);
    if (this.#onReposition) {
      window.removeEventListener("resize", this.#onReposition);
      window.removeEventListener("scroll", this.#onReposition);
    }
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
    if (open) {
      this.#trigger?.setAttribute("aria-describedby", this.#id);
      queueMicrotask(() => this.#position());
    } else {
      this.#trigger?.removeAttribute("aria-describedby");
    }
  }

  #position() {
    if (!this.hasAttribute("open") || !this.#tip || !this.#trigger) return;
    const triggerRect = this.#trigger.getBoundingClientRect();
    const tipRect = this.#tip.getBoundingClientRect();
    const side = (this.getAttribute("side") || "top") as "top" | "bottom" | "left" | "right";
    const align = (this.getAttribute("align") || "center") as "start" | "center" | "end";
    const offset = 8;

    let left = 0;
    let top = 0;

    if (side === "top") {
      top = triggerRect.top - tipRect.height - offset;
      if (align === "start") left = triggerRect.left;
      else if (align === "end") left = triggerRect.right - tipRect.width;
      else left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
    } else if (side === "bottom") {
      top = triggerRect.bottom + offset;
      if (align === "start") left = triggerRect.left;
      else if (align === "end") left = triggerRect.right - tipRect.width;
      else left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
    } else if (side === "left") {
      left = triggerRect.left - tipRect.width - offset;
      if (align === "start") top = triggerRect.top;
      else if (align === "end") top = triggerRect.bottom - tipRect.height;
      else top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
    } else {
      left = triggerRect.right + offset;
      if (align === "start") top = triggerRect.top;
      else if (align === "end") top = triggerRect.bottom - tipRect.height;
      else top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
    }

    const pad = 8;
    left = Math.max(pad, Math.min(window.innerWidth - tipRect.width - pad, left));
    top = Math.max(pad, Math.min(window.innerHeight - tipRect.height - pad, top));

    this.#tip.style.left = `${left}px`;
    this.#tip.style.top = `${top}px`;
  }
}
