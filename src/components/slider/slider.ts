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
    .marks{
      position:absolute;
      inset:0;
      pointer-events:none;
    }
    .mark{
      position:absolute;
      top:50%;
      transform:translate(-50%, -50%);
      width:2px;
      height:8px;
      background:var(--gl-border);
      border-radius:1px;
    }
    :host([size="sm"]) .mark{height:6px;width:1.5px}
    :host([size="lg"]) .mark{height:10px;width:2.5px}
    .mark-label{
      position:absolute;
      top:calc(100% + 4px);
      left:50%;
      transform:translateX(-50%);
      font-size:11px;
      color:var(--gl-muted);
      white-space:nowrap;
    }
    :host([size="sm"]) .mark-label{font-size:10px}
    :host([size="lg"]) .mark-label{font-size:12px}
  </style>
  <div part="track" class="track" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div part="fill" class="fill"></div>
    <div part="marks" class="marks"></div>
    <div part="thumb" class="thumb"></div>
    <div part="thumb-end" class="thumb thumb-end" style="display:none"></div>
  </div>
`;

export class GlSlider extends HTMLElement {
  static tagName = "gl-slider";
  static get observedAttributes() {
    return ["value", "min", "max", "step", "disabled", "size", "marks", "range", "value-start", "value-end"];
  }

  #track!: HTMLDivElement;
  #fill!: HTMLDivElement;
  #thumb!: HTMLDivElement;
  #thumbEnd!: HTMLDivElement;
  #marks!: HTMLDivElement;
  #activeThumb: "start" | "end" | null = null;
  #onPointerDown?: (e: PointerEvent) => void;
  #onPointerMove?: (e: PointerEvent) => void;
  #onPointerUp?: () => void;

  get value() {
    return Number(this.getAttribute("value")) || 0;
  }
  set value(v: number) {
    this.setAttribute("value", String(v));
  }

  get valueStart() {
    return Number(this.getAttribute("value-start")) || this.min;
  }
  set valueStart(v: number) {
    this.setAttribute("value-start", String(v));
  }

  get valueEnd() {
    return Number(this.getAttribute("value-end")) || this.max;
  }
  set valueEnd(v: number) {
    this.setAttribute("value-end", String(v));
  }

  get range() {
    return this.hasAttribute("range");
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
    this.#thumbEnd = this.shadowRoot!.querySelector(".thumb-end") as HTMLDivElement;
    this.#marks = this.shadowRoot!.querySelector(".marks") as HTMLDivElement;
    this.#sync();
    this.#track.addEventListener("click", (e) => this.#handleClick(e));
    this.#track.addEventListener("keydown", (e) => this.#handleKeydown(e));
    this.#onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      this.setAttribute("dragging", "");
      this.#track.setPointerCapture(e.pointerId);
      if (this.range) {
        this.#determineActiveThumb(e);
      }
      this.#updateFromEvent(e);
    };
    this.#onPointerMove = (e: PointerEvent) => {
      if (!this.hasAttribute("dragging")) return;
      this.#updateFromEvent(e);
    };
    this.#onPointerUp = () => {
      this.removeAttribute("dragging");
      this.#activeThumb = null;
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
    const min = this.min;
    const max = this.max;

    if (this.range) {
      const start = this.valueStart;
      const end = this.valueEnd;
      const startPercent = ((start - min) / (max - min)) * 100;
      const endPercent = ((end - min) / (max - min)) * 100;
      
      this.#fill.style.left = `${startPercent}%`;
      this.#fill.style.width = `${endPercent - startPercent}%`;
      this.#thumb.style.left = `${startPercent}%`;
      this.#thumbEnd.style.left = `${endPercent}%`;
      this.#thumbEnd.style.display = "block";
      
      this.#track.setAttribute("aria-valuemin", String(start));
      this.#track.setAttribute("aria-valuemax", String(end));
    } else {
      const val = this.value;
      const percent = ((val - min) / (max - min)) * 100;
      this.#fill.style.left = "0";
      this.#fill.style.width = `${percent}%`;
      this.#thumb.style.left = `${percent}%`;
      this.#thumbEnd.style.display = "none";
      this.#track.setAttribute("aria-valuenow", String(val));
    }

    this.#track.setAttribute("aria-disabled", String(this.hasAttribute("disabled")));
    if (this.hasAttribute("disabled")) {
      this.#track.setAttribute("tabindex", "-1");
    } else {
      this.#track.setAttribute("tabindex", "0");
    }

    // Update marks
    if (this.hasAttribute("marks") && this.#marks) {
      this.#updateMarks();
    }
  }

  #updateMarks() {
    if (!this.#marks) return;
    const marksAttr = this.getAttribute("marks");
    if (!marksAttr) {
      this.#marks.innerHTML = "";
      return;
    }

    try {
      const marks = JSON.parse(marksAttr) as Array<{ value: number; label?: string }> | number;
      const min = this.min;
      const max = this.max;
      
      let markValues: Array<{ value: number; label?: string }> = [];
      
      if (typeof marks === "number") {
        // Generate evenly spaced marks
        const step = (max - min) / (marks + 1);
        for (let i = 1; i <= marks; i++) {
          markValues.push({ value: min + step * i });
        }
      } else if (Array.isArray(marks)) {
        markValues = marks;
      }

      this.#marks.innerHTML = "";
      markValues.forEach((mark) => {
        const percent = ((mark.value - min) / (max - min)) * 100;
        const markEl = document.createElement("div");
        markEl.className = "mark";
        markEl.style.left = `${percent}%`;
        if (mark.label) {
          const label = document.createElement("div");
          label.className = "mark-label";
          label.textContent = mark.label;
          markEl.appendChild(label);
        }
        this.#marks.appendChild(markEl);
      });
    } catch {
      // Invalid marks format, ignore
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

    if (this.range) {
      const start = this.valueStart;
      const end = this.valueEnd;
      const mid = (start + end) / 2;
      
      if (!this.#activeThumb) {
        this.#activeThumb = newValue < mid ? "start" : "end";
      }

      if (this.#activeThumb === "start") {
        const clamped = Math.min(newValue, end);
        if (clamped !== start) {
          this.valueStart = clamped;
          emit(this, "gl-change", { start: clamped, end });
        }
      } else {
        const clamped = Math.max(newValue, start);
        if (clamped !== end) {
          this.valueEnd = clamped;
          emit(this, "gl-change", { start, end: clamped });
        }
      }
    } else {
      if (newValue !== this.value) {
        this.value = newValue;
        emit(this, "gl-change", { value: newValue });
      }
    }
  }

  #determineActiveThumb(e: MouseEvent | PointerEvent) {
    const rect = this.#track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const min = this.min;
    const max = this.max;
    const clickValue = min + (percent / 100) * (max - min);
    const start = this.valueStart;
    const end = this.valueEnd;
    const startDist = Math.abs(clickValue - start);
    const endDist = Math.abs(clickValue - end);
    this.#activeThumb = startDist < endDist ? "start" : "end";
  }

