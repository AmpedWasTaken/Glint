import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    label{display:block}
    .wrap{display:grid;gap:var(--gl-space-2)}
    .label{font-size:var(--gl-text-md);line-height:var(--gl-line-md);color:var(--gl-fg)}
    .desc{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm);color:var(--gl-muted)}
    .field{
      display:flex;
      align-items:center;
      gap:var(--gl-space-2);
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:var(--gl-radius-sm);
      padding:10px 12px;
      box-shadow:var(--gl-shadow-sm);
      transition:border-color var(--gl-dur-1) var(--gl-ease), box-shadow var(--gl-dur-1) var(--gl-ease);
    }
    .field:focus-within{border-color:var(--gl-ring); box-shadow:0 0 0 4px var(--gl-ring)}
    :host([error]) .field{border-color:color-mix(in srgb, var(--gl-danger) 70%, var(--gl-border)); box-shadow:0 0 0 4px color-mix(in srgb, var(--gl-danger) 25%, transparent)}
    :host([success]) .field{border-color:color-mix(in srgb, var(--gl-success) 70%, var(--gl-border)); box-shadow:0 0 0 4px color-mix(in srgb, var(--gl-success) 25%, transparent)}
    input{
      all:unset;
      flex:1;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      min-width:0;
    }
    input::placeholder{color:color-mix(in srgb, var(--gl-muted) 80%, transparent)}
    :host([disabled]){opacity:0.65}
    :host([disabled]) .field{cursor:not-allowed}
    :host([disabled]) input{pointer-events:none}
    ::slotted([slot="prefix"]), ::slotted([slot="suffix"]){display:inline-flex;align-items:center}
    .message{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm)}
    :host([error]) .message{color:var(--gl-danger)}
    :host([success]) .message{color:var(--gl-success)}
    :host(:not([error]):not([success])) .message{display:none}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <slot name="prefix"></slot>
      <input part="input" />
      <slot name="suffix"></slot>
    </span>
    <span part="message" class="message" aria-live="polite"></span>
  </label>
`;

export class GlInput extends HTMLElement {
  static tagName = "gl-input";
  static get observedAttributes() {
    return [
      "value",
      "placeholder",
      "disabled",
      "type",
      "name",
      "autocomplete",
      "required",
      "pattern",
      "min",
      "max",
      "step",
      "minlength",
      "maxlength",
      "error",
      "success"
    ];
  }

  #input!: HTMLInputElement;
  #message!: HTMLSpanElement;
  #autoError = false;
  #hasInteracted = false;

  get value() {
    return this.#input?.value ?? this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  override focus(options?: FocusOptions) {
    this.#input?.focus(options);
  }

  checkValidity() {
    return this.#input?.checkValidity() ?? true;
  }

  reportValidity() {
    const valid = this.#input?.reportValidity() ?? true;
    if (!valid && this.#input) {
      this.#hasInteracted = true;
      if (!this.hasAttribute("error") && !this.hasAttribute("success")) {
        this.#autoError = true;
        this.setAttribute("error", this.#input.validationMessage || "Invalid value");
      }
    }
    return valid;
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) root.appendChild(template.content.cloneNode(true));
    this.#input = root.querySelector("input")!;
    this.#message = root.querySelector(".message") as HTMLSpanElement;
    this.#sync();

    this.#input.addEventListener("input", () => {
      this.setAttribute("value", this.#input.value);
      if (this.#hasInteracted && this.#input.value.length > 0) {
        if (this.#input.checkValidity()) {
          if (this.#autoError) {
            this.#autoError = false;
            this.removeAttribute("error");
          }
        } else if (this.#autoError || !this.hasAttribute("error")) {
          this.#autoError = true;
          this.setAttribute("error", this.#input.validationMessage || "Invalid value");
        }
      }
      emit(this, "gl-change", { value: this.#input.value });
    });
    this.#input.addEventListener("blur", () => {
      this.#hasInteracted = true;
      if (this.#input.value.length > 0 && !this.#input.checkValidity()) {
        if (!this.hasAttribute("error") && !this.hasAttribute("success")) {
          this.#autoError = true;
          this.setAttribute("error", this.#input.validationMessage || "Invalid value");
        }
      } else if (this.#autoError && this.#input.checkValidity()) {
        this.#autoError = false;
        this.removeAttribute("error");
      }
    });
    this.#input.addEventListener("change", () => {
      emit(this, "gl-commit", { value: this.#input.value });
    });
    this.#input.addEventListener("invalid", () => {
      this.#hasInteracted = true;
      if (this.hasAttribute("error") || this.hasAttribute("success")) return;
      this.#autoError = true;
      this.setAttribute("error", this.#input.validationMessage || "Invalid value");
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#input) return;
    const value = this.getAttribute("value");
    if (value !== null && this.#input.value !== value) this.#input.value = value;
    this.#input.placeholder = this.getAttribute("placeholder") ?? "";
    this.#input.disabled = this.hasAttribute("disabled");
    this.#input.type = this.getAttribute("type") ?? "text";
    this.#input.name = this.getAttribute("name") ?? "";
    const ac = this.getAttribute("autocomplete");
    if (ac !== null) this.#input.setAttribute("autocomplete", ac);

    this.#input.required = this.hasAttribute("required");
    const pattern = this.getAttribute("pattern");
    if (pattern !== null) this.#input.pattern = pattern;
    const min = this.getAttribute("min");
    if (min !== null) this.#input.min = min;
    const max = this.getAttribute("max");
    if (max !== null) this.#input.max = max;
    const step = this.getAttribute("step");
    if (step !== null) this.#input.step = step;
    const minLen = this.getAttribute("minlength");
    if (minLen !== null) this.#input.minLength = Number(minLen);
    const maxLen = this.getAttribute("maxlength");
    if (maxLen !== null) this.#input.maxLength = Number(maxLen);

    const error = this.getAttribute("error");
    const success = this.getAttribute("success");
    if (error !== null) {
      this.removeAttribute("success");
      this.#input.setAttribute("aria-invalid", "true");
      if (this.#message) this.#message.textContent = error || "Invalid value";
    } else if (success !== null) {
      this.removeAttribute("error");
      this.#input.removeAttribute("aria-invalid");
      if (this.#message) this.#message.textContent = success || "Looks good";
    } else {
      this.#input.removeAttribute("aria-invalid");
      if (this.#message) this.#message.textContent = "";
    }
  }
}
