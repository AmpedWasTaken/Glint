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
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <slot name="prefix"></slot>
      <input part="input" />
      <slot name="suffix"></slot>
    </span>
  </label>
`;

export class GlInput extends HTMLElement {
  static tagName = "gl-input";
  static get observedAttributes() {
    return ["value", "placeholder", "disabled", "type", "name", "autocomplete"];
  }

  #input!: HTMLInputElement;

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
    this.#input = this.shadowRoot!.querySelector("input")!;
    this.#sync();

    this.#input.addEventListener("input", () => {
      this.setAttribute("value", this.#input.value);
      emit(this, "gl-change", { value: this.#input.value });
    });
    this.#input.addEventListener("change", () => {
      emit(this, "gl-commit", { value: this.#input.value });
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
  }
}


