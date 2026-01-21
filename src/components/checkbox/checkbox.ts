import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block}
    label{display:inline-flex;align-items:center;gap:var(--gl-space-2);cursor:pointer;user-select:none}
    input{position:absolute;opacity:0;pointer-events:none}
    .box{
      width:18px;height:18px;border-radius:6px;
      border:1px solid var(--gl-border);
      background:var(--gl-panel);
      box-shadow:var(--gl-shadow-sm);
      display:grid;place-items:center;
      transition:background var(--gl-dur-1) var(--gl-ease), border-color var(--gl-dur-1) var(--gl-ease);
    }
    .mark{width:12px;height:12px;border-radius:3px;background:transparent}
    :host([checked]) .box{background:var(--gl-primary);border-color:transparent}
    :host([checked]) .mark{background:var(--gl-primary-fg)}
    :host(:focus-visible) .box{outline:2px solid var(--gl-ring);outline-offset:2px}
    :host([disabled]){opacity:0.6}
    :host([disabled]) label{cursor:not-allowed}
    .text{font-size:var(--gl-text-md);line-height:var(--gl-line-md)}
  </style>
  <label part="label">
    <span class="box" part="box" aria-hidden="true"><span class="mark" part="mark"></span></span>
    <span class="text" part="text"><slot></slot></span>
    <input part="input" type="checkbox" />
  </label>
`;

export class GlCheckbox extends HTMLElement {
  static tagName = "gl-checkbox";
  static get observedAttributes() {
    return ["checked", "disabled", "name", "value"];
  }

  #input!: HTMLInputElement;

  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(v: boolean) {
    if (v) this.setAttribute("checked", "");
    else this.removeAttribute("checked");
  }

  override focus(options?: FocusOptions) {
    this.#input?.focus(options);
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#input = this.shadowRoot!.querySelector("input")!;
    this.#sync();

    this.setAttribute("role", "checkbox");
    this.tabIndex = this.tabIndex || 0;

    this.addEventListener("click", (e) => {
      if (this.hasAttribute("disabled")) {
        e.preventDefault();
        return;
      }
      if (e.composedPath().includes(this.#input)) return;
      this.#toggle();
    });

    this.addEventListener("keydown", (e) => {
      if (this.hasAttribute("disabled")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.#toggle();
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #toggle() {
    this.checked = !this.checked;
    emit(this, "gl-change", { checked: this.checked });
  }

  #sync() {
    if (!this.#input) return;
    const disabled = this.hasAttribute("disabled");
    this.#input.disabled = disabled;
    this.#input.checked = this.checked;
    this.#input.name = this.getAttribute("name") ?? "";
    this.#input.value = this.getAttribute("value") ?? "on";
    this.setAttribute("aria-checked", String(this.checked));
    this.setAttribute("aria-disabled", String(disabled));
  }
}
