const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    :host{--gl-tilt-x:0deg;--gl-tilt-y:0deg;--gl-tilt-z:0deg;--gl-tilt-depth:10px}
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
    :host([surface="glass"]) .card{
      background:var(--gl-glass-bg);
      border-color:var(--gl-glass-border);
      backdrop-filter:blur(var(--gl-glass-blur));
      -webkit-backdrop-filter:blur(var(--gl-glass-blur));
    }

    :host([effect="tilt"]) .card{
      transform-style:preserve-3d;
      transition:transform var(--gl-dur-3) var(--gl-ease-out), box-shadow var(--gl-dur-2) var(--gl-ease);
    }
    :host([effect="tilt"]:hover) .card{
      box-shadow:var(--gl-shadow-xl);
      transform:
        perspective(900px)
        rotateX(var(--gl-tilt-x))
        rotateY(var(--gl-tilt-y))
        translateZ(var(--gl-tilt-z));
    }
    @media (prefers-reduced-motion: reduce) {
      :host([effect="tilt"]) .card{transition:none}
      :host([effect="tilt"]:hover) .card{transform:none}
    }
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

  #card!: HTMLElement;
  #onMove?: (e: PointerEvent) => void;
  #onLeave?: () => void;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#card = this.shadowRoot!.querySelector(".card") as HTMLElement;
    this.#wireTilt();
  }

  attributeChangedCallback() {
    this.#wireTilt();
  }

  static get observedAttributes() {
    return ["effect"];
  }

  #wireTilt() {
    if (!this.#card) return;
    const isTilt = this.getAttribute("effect") === "tilt";
    if (!isTilt) {
      if (this.#onMove) this.#card.removeEventListener("pointermove", this.#onMove);
      if (this.#onLeave) this.#card.removeEventListener("pointerleave", this.#onLeave);
      this.style.removeProperty("--gl-tilt-x");
      this.style.removeProperty("--gl-tilt-y");
      this.style.removeProperty("--gl-tilt-z");
      this.#onMove = undefined;
      this.#onLeave = undefined;
      return;
    }

    if (this.#onMove) return;

    this.#onMove = (e: PointerEvent) => {
      const r = this.#card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 10;
      const ry = (px - 0.5) * 12;
      this.style.setProperty("--gl-tilt-x", `${rx}deg`);
      this.style.setProperty("--gl-tilt-y", `${ry}deg`);
      this.style.setProperty("--gl-tilt-z", `var(--gl-tilt-depth)`);
    };

    this.#onLeave = () => {
      this.style.setProperty("--gl-tilt-x", "0deg");
      this.style.setProperty("--gl-tilt-y", "0deg");
      this.style.setProperty("--gl-tilt-z", "0deg");
    };

    this.#card.addEventListener("pointermove", this.#onMove);
    this.#card.addEventListener("pointerleave", this.#onLeave);
  }
}
