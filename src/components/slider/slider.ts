import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block;position:relative;touch-action:none}
    :host{--gl-slider-dur:var(--gl-dur-2);--gl-slider-ease:var(--gl-ease-spring);--gl-slider-amp:1}
    :host([motion="none"]){--gl-slider-dur:0ms}
    :host([motion="subtle"]){--gl-slider-dur:var(--gl-dur-3);--gl-slider-ease:var(--gl-ease-out);--gl-slider-amp:0.7}
    :host([motion="snappy"]){--gl-slider-dur:var(--gl-dur-2);--gl-slider-ease:var(--gl-ease-spring);--gl-slider-amp:1}
    :host([motion="bounce"]){--gl-slider-dur:var(--gl-dur-4);--gl-slider-ease:var(--gl-ease-bounce);--gl-slider-amp:1.15}
    .track{
      position:relative;
      width:100%;
      height:6px;
      background:var(--gl-border);
      border-radius:3px;
      cursor:pointer;
    }
    .fill{
      position:absolute;
      left:0;
      top:0;
      height:100%;
      background:var(--gl-primary);
      border-radius:3px;
      transition:width var(--gl-slider-dur) var(--gl-slider-ease), background var(--gl-dur-1) var(--gl-ease);
    }
    :host([motion="snappy"]) .fill{transition:width var(--gl-slider-dur) var(--gl-slider-ease), background var(--gl-dur-1) var(--gl-ease), transform var(--gl-slider-dur) var(--gl-slider-ease)}
    :host([motion="snappy"][dragging]) .fill{transform:scaleY(1.3)}
    .thumb{
      position:absolute;
      top:50%;
      left:0;
      width:18px;
      height:18px;
      background:var(--gl-panel);
      border:2px solid var(--gl-primary);
      border-radius:50%;
      box-shadow:var(--gl-shadow-md);
      transform:translate(-50%, -50%);
      cursor:grab;
      transition:transform var(--gl-slider-dur) var(--gl-slider-ease), box-shadow var(--gl-dur-1) var(--gl-ease), border-color var(--gl-dur-1) var(--gl-ease);
    }
    :host(:hover) .thumb{box-shadow:var(--gl-shadow-lg);transform:translate(-50%, -50%) scale(1.1)}
    :host([dragging]) .thumb{cursor:grabbing;transform:translate(-50%, -50%) scale(1.2);box-shadow:var(--gl-shadow-xl)}
    :host([disabled]){opacity:0.5;cursor:not-allowed;pointer-events:none}
    :host([size="sm"]) .track{height:4px}
    :host([size="sm"]) .thumb{width:14px;height:14px}
    :host([size="lg"]) .track{height:8px}
    :host([size="lg"]) .thumb{width:22px;height:22px}
  </style>
  <div part="track" class="track" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div part="fill" class="fill"></div>
    <div part="thumb" class="thumb"></div>
  </div>
`;

export class GlSlider extends HTMLElement {
  static tagName = "gl-slider";
  static get observedAttributes() {
    return ["value", "min", "max", "step", "disabled", "size"];
  }

  #track!: HTMLDivElement;
  #fill!: HTMLDivElement;
  #thumb!: HTMLDivElement;
  #onPointerDown?: (e: PointerEvent) => void;
  #onPointerMove?: (e: PointerEvent) => void;
  #onPointerUp?: () => void;

  get value() {
    return Number(this.getAttribute("value")) || 0;
  }
  set value(v: number) {
    this.setAttribute("value", String(v));
  }

  get min() {
    return Number(this.getAttribute("min")) || 0;
  }
  get max() {
    return Number(this.getAttribute("max")) || 100;
  }
  get step() {
    return Number(this.getAttribute("step")) || 1;
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#track = this.shadowRoot!.querySelector(".track") as HTMLDivElement;
    this.#fill = this.shadowRoot!.querySelector(".fill") as HTMLDivElement;
    this.#thumb = this.shadowRoot!.querySelector(".thumb") as HTMLDivElement;
    this.#sync();
    this.#track.addEventListener("click", (e) => this.#handleClick(e));
    this.#track.addEventListener("keydown", (e) => this.#handleKeydown(e));
    this.#onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      this.setAttribute("dragging", "");
      this.#track.setPointerCapture(e.pointerId);
      this.#updateFromEvent(e);
    };
    this.#onPointerMove = (e: PointerEvent) => {
      if (!this.hasAttribute("dragging")) return;
      this.#updateFromEvent(e);
    };
    this.#onPointerUp = () => {
      this.removeAttribute("dragging");
    };
    this.#track.addEventListener("pointerdown", this.#onPointerDown);
    this.#track.addEventListener("pointermove", this.#onPointerMove);
    this.#track.addEventListener("pointerup", this.#onPointerUp);
    this.#track.addEventListener("pointercancel", this.#onPointerUp);
  }

  disconnectedCallback() {
    if (this.#onPointerDown) {
      this.#track.removeEventListener("pointerdown", this.#onPointerDown);
    }
    if (this.#onPointerMove) {
      this.#track.removeEventListener("pointermove", this.#onPointerMove);
    }
    if (this.#onPointerUp) {
      this.#track.removeEventListener("pointerup", this.#onPointerUp);
      this.#track.removeEventListener("pointercancel", this.#onPointerUp);
    }
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#track || !this.#fill || !this.#thumb) return;
    const val = this.value;
    const min = this.min;
    const max = this.max;
    const percent = ((val - min) / (max - min)) * 100;
    this.#fill.style.width = `${percent}%`;
    this.#thumb.style.left = `${percent}%`;
    this.#track.setAttribute("aria-valuenow", String(val));
    this.#track.setAttribute("aria-disabled", String(this.hasAttribute("disabled")));
    if (this.hasAttribute("disabled")) {
      this.#track.setAttribute("tabindex", "-1");
    } else {
      this.#track.setAttribute("tabindex", "0");
    }
  }

  #handleClick(e: MouseEvent) {
    if (this.hasAttribute("disabled")) return;
    this.#updateFromEvent(e);
  }

  #handleKeydown(e: KeyboardEvent) {
    if (this.hasAttribute("disabled")) return;
    const step = this.step;
    let newValue = this.value;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      newValue = Math.min(this.max, newValue + step);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      newValue = Math.max(this.min, newValue - step);
    } else if (e.key === "Home") {
      e.preventDefault();
      newValue = this.min;
    } else if (e.key === "End") {
      e.preventDefault();
      newValue = this.max;
    } else {
      return;
    }
    this.value = newValue;
    emit(this, "gl-change", { value: newValue });
  }

  #updateFromEvent(e: MouseEvent | PointerEvent) {
    if (this.hasAttribute("disabled")) return;
    const rect = this.#track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const min = this.min;
    const max = this.max;
    const step = this.step;
    let newValue = min + (percent / 100) * (max - min);
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));
    if (newValue !== this.value) {
      this.value = newValue;
      emit(this, "gl-change", { value: newValue });
    }
  }
}

