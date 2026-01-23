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
    :host([type="circular"]){display:inline-block}
    :host([type="circular"]) .track{display:none}
    .circular{
      display:none;
      width:64px;
      height:64px;
      position:relative;
    }
    :host([type="circular"]) .circular{display:block}
    :host([type="circular"][size="sm"]) .circular{width:48px;height:48px}
    :host([type="circular"][size="lg"]) .circular{width:80px;height:80px}
    .circular svg{
      width:100%;
      height:100%;
      transform:rotate(-90deg);
    }
    .circular circle{
      fill:none;
      stroke-width:4;
      stroke-linecap:round;
    }
    .circular .bg{
      stroke:var(--gl-border);
    }
    .circular .progress{
      stroke:var(--gl-primary);
      stroke-dasharray:var(--gl-circumference);
      stroke-dashoffset:calc(var(--gl-circumference) - (var(--gl-progress) * var(--gl-circumference) / 100));
      transition:stroke-dashoffset var(--gl-dur-3) var(--gl-ease-out);
    }
    :host([variant="destructive"]) .circular .progress{stroke:var(--gl-danger)}
    :host([variant="success"]) .circular .progress{stroke:var(--gl-success)}
    :host([variant="warning"]) .circular .progress{stroke:#f59e0b}
    .circular-text{
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:var(--gl-text-sm);
      font-weight:600;
      color:var(--gl-fg);
    }
    :host([type="circular"][size="sm"]) .circular-text{font-size:11px}
    :host([type="circular"][size="lg"]) .circular-text{font-size:var(--gl-text-md)}
    :host([type="steps"]){display:block}
    :host([type="steps"]) .track{display:none}
    .steps{
      display:none;
      display:flex;
      gap:var(--gl-space-2);
      align-items:center;
    }
    :host([type="steps"]) .steps{display:flex}
    .step{
      flex:1;
      height:4px;
      background:var(--gl-border);
      border-radius:2px;
      position:relative;
      overflow:hidden;
    }
    :host([type="steps"][size="sm"]) .step{height:3px}
    :host([type="steps"][size="lg"]) .step{height:6px}
    .step-fill{
      position:absolute;
      left:0;
      top:0;
      height:100%;
      width:0%;
      background:var(--gl-primary);
      border-radius:2px;
      transition:width var(--gl-dur-2) var(--gl-ease-out);
    }
    .step.complete .step-fill{width:100%}
    .step.active .step-fill{width:100%}
    :host([variant="destructive"]) .step-fill{background:var(--gl-danger)}
    :host([variant="success"]) .step-fill{background:var(--gl-success)}
    :host([variant="warning"]) .step-fill{background:#f59e0b}
  </style>
  <div class="label" part="label" style="display:none">
    <span part="label-text"><slot name="label"></slot></span>
    <span class="value" part="value"></span>
  </div>
  <div part="track" class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div part="bar" class="bar"></div>
  </div>
  <div part="circular" class="circular" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <svg viewBox="0 0 36 36">
      <circle class="bg" cx="18" cy="18" r="16"></circle>
      <circle class="progress" cx="18" cy="18" r="16"></circle>
    </svg>
    <div class="circular-text" part="circular-text"></div>
  </div>
  <div part="steps" class="steps" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
`;

export class GlProgress extends HTMLElement {
  static tagName = "gl-progress";
  static get observedAttributes() {
    return ["value", "size", "variant", "show-label", "type", "steps"];
  }

  #track!: HTMLElement;
  #bar!: HTMLElement;
  #label!: HTMLElement;
  #value!: HTMLElement;
  #circular!: HTMLElement;
  #circularProgress!: SVGCircleElement;
  #circularText!: HTMLElement;
  #steps!: HTMLElement;

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
    this.#circular = this.shadowRoot!.querySelector(".circular") as HTMLElement;
    this.#circularProgress = this.shadowRoot!.querySelector(".circular .progress") as SVGCircleElement;
    this.#circularText = this.shadowRoot!.querySelector(".circular-text") as HTMLElement;
    this.#steps = this.shadowRoot!.querySelector(".steps") as HTMLElement;
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const v = this.value;
    const type = this.getAttribute("type") || "linear";
    
    if (type === "circular") {
      if (!this.#circular || !this.#circularProgress) return;
      const radius = 16;
      const circumference = 2 * Math.PI * radius;
      this.style.setProperty("--gl-circumference", String(circumference));
      this.style.setProperty("--gl-progress", String(v));
      this.#circular.setAttribute("aria-valuenow", String(v));
      if (this.#circularText && this.hasAttribute("show-label")) {
        this.#circularText.textContent = `${Math.round(v)}%`;
      } else if (this.#circularText) {
        this.#circularText.textContent = "";
      }
    } else if (type === "steps") {
      if (!this.#steps) return;
      const stepsAttr = this.getAttribute("steps") || "5";
      const stepCount = Number(stepsAttr) || 5;
      const currentStep = Math.round((v / 100) * stepCount);
      
      // Clear and rebuild steps
      this.#steps.innerHTML = "";
      for (let i = 0; i < stepCount; i++) {
        const step = document.createElement("div");
        step.className = "step";
        if (i < currentStep) step.classList.add("complete");
        else if (i === currentStep - 1 && v > 0) step.classList.add("active");
        const fill = document.createElement("div");
        fill.className = "step-fill";
        step.appendChild(fill);
        this.#steps.appendChild(step);
      }
      this.#steps.setAttribute("aria-valuenow", String(v));
    } else {
      if (!this.#track || !this.#bar) return;
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
}
