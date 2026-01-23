const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }
    .countdown {
      display: flex;
      gap: var(--gl-space-2);
      align-items: center;
      font-variant-numeric: tabular-nums;
    }
    .countdown-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gl-space-1);
    }
    .countdown-value {
      font-size: var(--gl-text-2xl);
      font-weight: 700;
      line-height: 1;
      color: var(--gl-fg);
      min-width: 2ch;
      text-align: center;
    }
    .countdown-label {
      font-size: var(--gl-text-xs);
      color: var(--gl-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .countdown-separator {
      font-size: var(--gl-text-xl);
      font-weight: 600;
      color: var(--gl-muted);
      padding: 0 var(--gl-space-1);
    }
    :host([size="sm"]) .countdown-value {
      font-size: var(--gl-text-lg);
    }
    :host([size="md"]) .countdown-value {
      font-size: var(--gl-text-2xl);
    }
    :host([size="lg"]) .countdown-value {
      font-size: var(--gl-text-3xl);
    }
    :host([variant="compact"]) .countdown {
      gap: var(--gl-space-1);
    }
    :host([variant="compact"]) .countdown-separator {
      display: none;
    }
    :host([variant="inline"]) .countdown {
      gap: var(--gl-space-1);
    }
    :host([variant="inline"]) .countdown-item {
      flex-direction: row;
      gap: var(--gl-space-1);
    }
    :host([variant="inline"]) .countdown-separator {
      display: none;
    }
    :host([variant="inline"]) .countdown-label {
      text-transform: none;
      font-size: var(--gl-text-sm);
    }
  </style>
  <div class="countdown" part="countdown">
    <div class="countdown-item" part="days">
      <span class="countdown-value" part="days-value">00</span>
      <span class="countdown-label" part="days-label">Days</span>
    </div>
    <span class="countdown-separator" part="separator">:</span>
    <div class="countdown-item" part="hours">
      <span class="countdown-value" part="hours-value">00</span>
      <span class="countdown-label" part="hours-label">Hours</span>
    </div>
    <span class="countdown-separator" part="separator">:</span>
    <div class="countdown-item" part="minutes">
      <span class="countdown-value" part="minutes-value">00</span>
      <span class="countdown-label" part="minutes-label">Minutes</span>
    </div>
    <span class="countdown-separator" part="separator">:</span>
    <div class="countdown-item" part="seconds">
      <span class="countdown-value" part="seconds-value">00</span>
      <span class="countdown-label" part="seconds-label">Seconds</span>
    </div>
  </div>
`;

export class GlCountdown extends HTMLElement {
  static tagName = "gl-countdown";
  static get observedAttributes() {
    return ["target", "size", "variant", "show-days", "show-hours", "show-minutes", "show-seconds"];
  }

  #interval?: number;
  #daysValue!: HTMLElement;
  #hoursValue!: HTMLElement;
  #minutesValue!: HTMLElement;
  #secondsValue!: HTMLElement;
  #daysItem!: HTMLElement;
  #hoursItem!: HTMLElement;
  #minutesItem!: HTMLElement;
  #secondsItem!: HTMLElement;
  #separators!: NodeListOf<HTMLElement>;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#daysValue = this.shadowRoot!.querySelector('[part="days-value"]') as HTMLElement;
    this.#hoursValue = this.shadowRoot!.querySelector('[part="hours-value"]') as HTMLElement;
    this.#minutesValue = this.shadowRoot!.querySelector('[part="minutes-value"]') as HTMLElement;
    this.#secondsValue = this.shadowRoot!.querySelector('[part="seconds-value"]') as HTMLElement;
    this.#daysItem = this.shadowRoot!.querySelector('[part="days"]') as HTMLElement;
    this.#hoursItem = this.shadowRoot!.querySelector('[part="hours"]') as HTMLElement;
    this.#minutesItem = this.shadowRoot!.querySelector('[part="minutes"]') as HTMLElement;
    this.#secondsItem = this.shadowRoot!.querySelector('[part="seconds"]') as HTMLElement;
    this.#separators = this.shadowRoot!.querySelectorAll('[part="separator"]') as NodeListOf<HTMLElement>;

    this.#sync();
    this.#start();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  disconnectedCallback() {
    this.#stop();
  }

  #sync() {
    const showDays = this.hasAttribute("show-days");
    const showHours = this.hasAttribute("show-hours");
    const showMinutes = this.hasAttribute("show-minutes");
    const showSeconds = this.hasAttribute("show-seconds");

    this.#daysItem.style.display = showDays ? "flex" : "none";
    this.#hoursItem.style.display = showHours ? "flex" : "none";
    this.#minutesItem.style.display = showMinutes ? "flex" : "none";
    this.#secondsItem.style.display = showSeconds ? "flex" : "none";

    // Hide separators if only one item is shown
    const visibleItems = [showDays, showHours, showMinutes, showSeconds].filter(Boolean).length;
    this.#separators.forEach(sep => {
      sep.style.display = visibleItems > 1 ? "block" : "none";
    });

    this.#update();
  }

  #start() {
    this.#stop();
    this.#update();
    this.#interval = window.setInterval(() => {
      this.#update();
    }, 1000);
  }

  #stop() {
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = undefined;
    }
  }

  #update() {
    const target = this.getAttribute("target");
    if (!target) return;

    const targetDate = new Date(target).getTime();
    const now = Date.now();
    const diff = Math.max(0, targetDate - now);

    if (diff === 0) {
      this.#stop();
      this.dispatchEvent(new CustomEvent("gl-countdown-end"));
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.#daysValue.textContent = String(days).padStart(2, "0");
    this.#hoursValue.textContent = String(hours).padStart(2, "0");
    this.#minutesValue.textContent = String(minutes).padStart(2, "0");
    this.#secondsValue.textContent = String(seconds).padStart(2, "0");
  }

  get target() {
    return this.getAttribute("target") || "";
  }

  set target(v: string) {
    this.setAttribute("target", v);
  }

  get size() {
    return this.getAttribute("size") || "md";
  }

  set size(v: string) {
    this.setAttribute("size", v);
  }

  get variant() {
    return this.getAttribute("variant") || "default";
  }

  set variant(v: string) {
    this.setAttribute("variant", v);
  }
}
