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
      align-items:stretch;
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
    textarea{
      all:unset;
      flex:1;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      min-width:0;
      min-height:80px;
      white-space:pre-wrap;
      overflow:auto;
      resize:vertical;
    }
    :host([resize="none"]) textarea{resize:none}
    :host([resize="both"]) textarea{resize:both}
    :host([resize="horizontal"]) textarea{resize:horizontal}
    :host([resize="vertical"]) textarea{resize:vertical}
    textarea::placeholder{color:color-mix(in srgb, var(--gl-muted) 80%, transparent)}
    :host([disabled]){opacity:0.65}
    :host([disabled]) .field{cursor:not-allowed}
    :host([disabled]) textarea{pointer-events:none}
    .message{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm)}
    :host([error]) .message{color:var(--gl-danger)}
    :host([success]) .message{color:var(--gl-success)}
    :host(:not([error]):not([success])) .message{display:none}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <textarea part="textarea"></textarea>
    </span>
    <span part="message" class="message" aria-live="polite"></span>
  </label>
`;

export class GlTextarea extends HTMLElement {
  static tagName = "gl-textarea";
  static get observedAttributes() {
    return [
      "value",
      "placeholder",
      "disabled",
      "name",
      "autocomplete",
      "rows",
      "resize",
      "required",
      "minlength",
      "maxlength",
      "error",
      "success"
    ];
  }

  #textarea!: HTMLTextAreaElement;
  #message!: HTMLSpanElement;
  #autoError = false;
  #hasInteracted = false;

  get value() {
    return this.#textarea?.value ?? this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  override focus(options?: FocusOptions) {
    this.#textarea?.focus(options);
  }

  checkValidity() {
    return this.#textarea?.checkValidity() ?? true;
  }

  reportValidity() {
    const valid = this.#textarea?.reportValidity() ?? true;
    if (!valid && this.#textarea) {
      this.#hasInteracted = true;
      if (!this.hasAttribute("error") && !this.hasAttribute("success")) {
        this.#autoError = true;
        this.setAttribute("error", this.#textarea.validationMessage || "Invalid value");
      }
    }
    return valid;
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) root.appendChild(template.content.cloneNode(true));
    this.#textarea = root.querySelector("textarea")!;
    this.#message = root.querySelector(".message") as HTMLSpanElement;
    this.#sync();

    this.#textarea.addEventListener("input", () => {
      this.setAttribute("value", this.#textarea.value);
      if (this.#hasInteracted && this.#textarea.value.length > 0) {
        if (this.#textarea.checkValidity()) {
          if (this.#autoError) {
            this.#autoError = false;
            this.removeAttribute("error");
          }
        } else if (this.#autoError || !this.hasAttribute("error")) {
          this.#autoError = true;
          this.setAttribute("error", this.#textarea.validationMessage || "Invalid value");
        }
      }
      emit(this, "gl-change", { value: this.#textarea.value });
    });
    this.#textarea.addEventListener("blur", () => {
      this.#hasInteracted = true;
      if (this.#textarea.value.length > 0 && !this.#textarea.checkValidity()) {
        if (!this.hasAttribute("error") && !this.hasAttribute("success")) {
          this.#autoError = true;
          this.setAttribute("error", this.#textarea.validationMessage || "Invalid value");
        }
      } else if (this.#autoError && this.#textarea.checkValidity()) {
        this.#autoError = false;
        this.removeAttribute("error");
      }
    });
    this.#textarea.addEventListener("change", () => {
      emit(this, "gl-commit", { value: this.#textarea.value });
    });
    this.#textarea.addEventListener("invalid", () => {
      this.#hasInteracted = true;
      if (this.hasAttribute("error") || this.hasAttribute("success")) return;
      this.#autoError = true;
      this.setAttribute("error", this.#textarea.validationMessage || "Invalid value");
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#textarea) return;
    const value = this.getAttribute("value");
    if (value !== null && this.#textarea.value !== value) this.#textarea.value = value;
    this.#textarea.placeholder = this.getAttribute("placeholder") ?? "";
    this.#textarea.disabled = this.hasAttribute("disabled");
    this.#textarea.name = this.getAttribute("name") ?? "";

    const ac = this.getAttribute("autocomplete");
    if (ac !== null) this.#textarea.setAttribute("autocomplete", ac);

    const rows = this.getAttribute("rows");
    if (rows !== null) this.#textarea.rows = Math.max(1, Number(rows) || 1);

    this.#textarea.required = this.hasAttribute("required");
    const minLen = this.getAttribute("minlength");
    if (minLen !== null) this.#textarea.minLength = Number(minLen);
    const maxLen = this.getAttribute("maxlength");
    if (maxLen !== null) this.#textarea.maxLength = Number(maxLen);

    const error = this.getAttribute("error");
    const success = this.getAttribute("success");
    if (error !== null) {
      this.removeAttribute("success");
      this.#textarea.setAttribute("aria-invalid", "true");
      if (this.#message) this.#message.textContent = error || "Invalid value";
    } else if (success !== null) {
      this.removeAttribute("error");
      this.#textarea.removeAttribute("aria-invalid");
      if (this.#message) this.#message.textContent = success || "Looks good";
    } else {
      this.#textarea.removeAttribute("aria-invalid");
      if (this.#message) this.#message.textContent = "";
    }
  }
}


