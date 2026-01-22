import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block;position:relative}
    .wrap{display:grid;gap:var(--gl-space-2);position:relative}
    .label{font-size:var(--gl-text-md);line-height:var(--gl-line-md);color:var(--gl-fg)}
    .desc{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm);color:var(--gl-muted)}
    .field{
      display:flex;
      align-items:center;
      gap:8px;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:6px;
      padding:8px 12px;
      transition:border-color 0.2s ease, box-shadow 0.2s ease;
      position:relative;
    }
    .field:hover{border-color:color-mix(in srgb, var(--gl-border) 80%, var(--gl-fg))}
    .field:focus-within{
      border-color:var(--gl-ring);
      box-shadow:0 0 0 3px color-mix(in srgb, var(--gl-ring) 20%, transparent);
      outline:none;
    }
    :host([error]) .field{
      border-color:var(--gl-danger);
      box-shadow:0 0 0 3px color-mix(in srgb, var(--gl-danger) 20%, transparent);
    }
    input{
      all:unset;
      flex:1;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      min-width:0;
    }
    input::placeholder{color:color-mix(in srgb, var(--gl-muted) 80%, transparent)}
    .picker{
      position:fixed;
      left:0;
      top:0;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:8px;
      box-shadow:0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      padding:6px;
      z-index:var(--gl-z-popover);
      display:none;
      min-width:180px;
      backdrop-filter:blur(12px);
      -webkit-backdrop-filter:blur(12px);
    }
    .picker.open{
      display:block;
      animation:slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideDown{
      from{
        opacity:0;
        transform:translateY(-8px) scale(0.96);
      }
      to{
        opacity:1;
        transform:translateY(0) scale(1);
      }
    }
    .time-grid{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:3px;
      margin-bottom:6px;
      padding:6px 2px;
    }
    .time-control{
      display:flex;
      flex-direction:column;
      gap:3px;
      align-items:center;
      position:relative;
    }
    .time-label{
      font-size:8px;
      line-height:10px;
      color:var(--gl-muted);
      text-transform:uppercase;
      font-weight:600;
      letter-spacing:0.5px;
    }
    .time-input-wrapper{
      position:relative;
      display:flex;
      flex-direction:column;
      gap:0;
    }
    .time-input{
      all:unset;
      background:transparent;
      border:none;
      border-bottom:1.5px solid var(--gl-border);
      border-radius:0;
      padding:2px 6px;
      text-align:center;
      font-size:18px;
      line-height:22px;
      font-weight:600;
      min-width:42px;
      transition:border-color 0.15s ease, color 0.15s ease;
      color:var(--gl-fg);
      -moz-appearance:textfield;
    }
    .time-input::-webkit-outer-spin-button,
    .time-input::-webkit-inner-spin-button{
      -webkit-appearance:none;
      margin:0;
    }
    .time-input:hover{
      border-bottom-color:var(--gl-primary);
    }
    .time-input:focus{
      border-bottom-color:var(--gl-primary);
      outline:none;
      color:var(--gl-primary);
    }
    .time-control-buttons{
      display:flex;
      flex-direction:column;
      gap:1px;
      position:absolute;
      right:-16px;
      top:50%;
      transform:translateY(-50%);
      opacity:0;
      transition:opacity 0.15s ease;
      pointer-events:none;
    }
    .time-control:hover .time-control-buttons{
      opacity:1;
      pointer-events:auto;
    }
    .time-btn{
      all:unset;
      cursor:pointer;
      width:14px;
      height:14px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:2px;
      background:var(--gl-hover);
      color:var(--gl-muted);
      font-size:8px;
      line-height:1;
      transition:background 0.15s ease, color 0.15s ease;
    }
    .time-btn:hover{
      background:var(--gl-primary);
      color:var(--gl-primary-fg);
    }
    .separator{
      font-size:18px;
      line-height:1;
      color:var(--gl-muted);
      font-weight:600;
      padding:0 2px;
      align-self:flex-end;
      margin-bottom:6px;
    }
    .actions{
      display:flex;
      justify-content:flex-end;
      gap:3px;
      margin-top:2px;
      padding-top:6px;
      border-top:1px solid var(--gl-border);
    }
    .actions button{
      all:unset;
      cursor:pointer;
      padding:3px 10px;
      border-radius:4px;
      font-size:11px;
      line-height:14px;
      font-weight:500;
      transition:background 0.15s ease, color 0.15s ease;
    }
    .actions button[part="cancel"]{
      color:var(--gl-muted);
    }
    .actions button[part="cancel"]:hover{
      background:var(--gl-hover);
      color:var(--gl-fg);
    }
    .actions button[part="confirm"]{
      background:var(--gl-primary);
      color:var(--gl-primary-fg);
    }
    .actions button[part="confirm"]:hover{
      background:color-mix(in srgb, var(--gl-primary) 90%, black);
    }
    .actions button:focus-visible{
      outline:2px solid var(--gl-ring);
      outline-offset:2px;
    }
    :host([disabled]){opacity:0.65}
    :host([disabled]) .field{cursor:not-allowed}
    :host([disabled]) input{pointer-events:none}
    .message{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm)}
    :host([error]) .message{color:var(--gl-danger)}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <input part="input" type="text" />
      <slot name="suffix"></slot>
    </span>
    <div class="picker" part="picker">
      <div class="time-grid">
        <div class="time-control">
          <span class="time-label">Hour</span>
          <div class="time-input-wrapper">
            <input class="time-input" part="hour" type="number" min="0" max="23" value="0" />
            <div class="time-control-buttons">
              <button type="button" class="time-btn" data-action="hour-up">▲</button>
              <button type="button" class="time-btn" data-action="hour-down">▼</button>
            </div>
          </div>
        </div>
        <span class="separator">:</span>
        <div class="time-control">
          <span class="time-label">Minute</span>
          <div class="time-input-wrapper">
            <input class="time-input" part="minute" type="number" min="0" max="59" value="0" />
            <div class="time-control-buttons">
              <button type="button" class="time-btn" data-action="minute-up">▲</button>
              <button type="button" class="time-btn" data-action="minute-down">▼</button>
            </div>
          </div>
        </div>
        <div class="time-control" style="display:none">
          <span class="time-label">Second</span>
          <div class="time-input-wrapper">
            <input class="time-input" part="second" type="number" min="0" max="59" value="0" />
            <div class="time-control-buttons">
              <button type="button" class="time-btn" data-action="second-up">▲</button>
              <button type="button" class="time-btn" data-action="second-down">▼</button>
            </div>
          </div>
        </div>
      </div>
      <div class="actions">
        <button type="button" part="cancel">Cancel</button>
        <button type="button" part="confirm">Apply</button>
      </div>
    </div>
    <span part="message" class="message" aria-live="polite"></span>
  </label>
`;

export class GlTimePicker extends HTMLElement {
  static tagName = "gl-time-picker";
  static get observedAttributes() {
    return [
      "value",
      "placeholder",
      "disabled",
      "name",
      "required",
      "format",
      "error"
    ];
  }

  #input!: HTMLInputElement;
  #field!: HTMLSpanElement;
  #picker!: HTMLDivElement;
  #hourInput!: HTMLInputElement;
  #minuteInput!: HTMLInputElement;
  #secondInput!: HTMLInputElement;
  #cancelBtn!: HTMLButtonElement;
  #confirmBtn!: HTMLButtonElement;
  #message!: HTMLSpanElement;
  #format = "HH:mm";

  get value() {
    return this.#input?.value ?? this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  override focus(options?: FocusOptions) {
    this.#input?.focus(options);
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#input = this.shadowRoot!.querySelector("input[type='text']")!;
    this.#field = this.shadowRoot!.querySelector(".field") as HTMLSpanElement;
    this.#picker = this.shadowRoot!.querySelector(".picker") as HTMLDivElement;
    this.#hourInput = this.shadowRoot!.querySelector("input[part='hour']") as HTMLInputElement;
    this.#minuteInput = this.shadowRoot!.querySelector("input[part='minute']") as HTMLInputElement;
    this.#secondInput = this.shadowRoot!.querySelector("input[part='second']") as HTMLInputElement;
    this.#cancelBtn = this.shadowRoot!.querySelector("button[part='cancel']") as HTMLButtonElement;
    this.#confirmBtn = this.shadowRoot!.querySelector("button[part='confirm']") as HTMLButtonElement;
    this.#message = this.shadowRoot!.querySelector(".message") as HTMLSpanElement;
    
    this.#format = this.getAttribute("format") || "HH:mm";
    if (this.#format.includes("ss")) {
      this.#picker.querySelector(".time-control:last-child")?.setAttribute("style", "display:flex");
    }
    
    this.#sync();

    this.#input.addEventListener("click", () => {
      if (!this.hasAttribute("disabled")) {
        this.#showPicker();
      }
    });
    
    this.#input.addEventListener("focus", () => {
      if (!this.hasAttribute("disabled")) {
        this.#showPicker();
      }
    });

    this.#input.addEventListener("input", () => {
      // Allow manual typing but don't trigger change until validated
    });

    this.#hourInput.addEventListener("input", () => {
      const val = Number(this.#hourInput.value);
      if (val < 0) this.#hourInput.value = "0";
      if (val > 23) this.#hourInput.value = "23";
    });

    this.#minuteInput.addEventListener("input", () => {
      const val = Number(this.#minuteInput.value);
      if (val < 0) this.#minuteInput.value = "0";
      if (val > 59) this.#minuteInput.value = "59";
    });

    this.#secondInput.addEventListener("input", () => {
      const val = Number(this.#secondInput.value);
      if (val < 0) this.#secondInput.value = "0";
      if (val > 59) this.#secondInput.value = "59";
    });

    // Add increment/decrement buttons
    this.#picker.querySelectorAll(".time-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const action = (btn as HTMLElement).dataset.action;
        if (action === "hour-up") {
          const val = Number(this.#hourInput.value) + 1;
          this.#hourInput.value = String(val > 23 ? 0 : val);
        } else if (action === "hour-down") {
          const val = Number(this.#hourInput.value) - 1;
          this.#hourInput.value = String(val < 0 ? 23 : val);
        } else if (action === "minute-up") {
          const val = Number(this.#minuteInput.value) + 1;
          this.#minuteInput.value = String(val > 59 ? 0 : val);
        } else if (action === "minute-down") {
          const val = Number(this.#minuteInput.value) - 1;
          this.#minuteInput.value = String(val < 0 ? 59 : val);
        } else if (action === "second-up") {
          const val = Number(this.#secondInput.value) + 1;
          this.#secondInput.value = String(val > 59 ? 0 : val);
        } else if (action === "second-down") {
          const val = Number(this.#secondInput.value) - 1;
          this.#secondInput.value = String(val < 0 ? 59 : val);
        }
      });
    });

    this.#confirmBtn.addEventListener("click", () => {
      this.#applyTime();
    });

    this.#cancelBtn.addEventListener("click", () => {
      this.#hidePicker();
    });

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (this.#picker.classList.contains("open")) {
        const isInsideComponent = this.contains(target) || this.shadowRoot?.contains(target);
        const isInsidePicker = this.#picker.contains(target);
        if (!isInsideComponent && !isInsidePicker) {
          this.#hidePicker();
        }
      }
    };
    const handleReposition = () => {
      if (this.#picker.classList.contains("open")) {
        this.#positionPicker();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    window.addEventListener("resize", handleReposition, { passive: true });
    window.addEventListener("scroll", handleReposition, { passive: true });

    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.#picker.classList.contains("open")) {
        this.#hidePicker();
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #showPicker() {
    const value = this.#input.value || "00:00:00";
    const [hours, minutes, seconds = "00"] = value.split(":");
    this.#hourInput.value = hours || "0";
    this.#minuteInput.value = minutes || "0";
    this.#secondInput.value = seconds || "0";
    this.#picker.classList.add("open");
    queueMicrotask(() => this.#positionPicker());
  }

  #hidePicker() {
    this.#picker.classList.remove("open");
  }

  #positionPicker() {
    if (!this.#picker.classList.contains("open")) return;
    const field = this.#field.getBoundingClientRect();
    const picker = this.#picker.getBoundingClientRect();
    
    let left = field.left;
    let top = field.bottom + 8;
    
    const pad = 12;
    if (left + picker.width > window.innerWidth - pad) {
      left = window.innerWidth - picker.width - pad;
    }
    if (left < pad) left = pad;
    
    if (top + picker.height > window.innerHeight - pad) {
      top = field.top - picker.height - 8;
    }
    if (top < pad) top = pad;
    
    this.#picker.style.left = `${left}px`;
    this.#picker.style.top = `${top}px`;
  }

  #applyTime() {
    const hours = String(Number(this.#hourInput.value) || 0).padStart(2, "0");
    const minutes = String(Number(this.#minuteInput.value) || 0).padStart(2, "0");
    const seconds = String(Number(this.#secondInput.value) || 0).padStart(2, "0");
    
    let timeValue = "";
    if (this.#format.includes("ss")) {
      timeValue = `${hours}:${minutes}:${seconds}`;
    } else {
      timeValue = `${hours}:${minutes}`;
    }
    
    this.value = timeValue;
    this.#input.value = timeValue;
    this.#hidePicker();
    emit(this, "gl-change", { value: timeValue });
  }

  #sync() {
    if (!this.#input) return;
    const value = this.getAttribute("value");
    if (value !== null && this.#input.value !== value) {
      this.#input.value = value;
    }
    this.#input.placeholder = this.getAttribute("placeholder") ?? "";
    this.#input.disabled = this.hasAttribute("disabled");
    this.#input.name = this.getAttribute("name") ?? "";
    this.#input.required = this.hasAttribute("required");
    
    const error = this.getAttribute("error");
    if (error !== null && this.#message) {
      this.#message.textContent = error;
    } else if (this.#message) {
      this.#message.textContent = "";
    }
  }
}

