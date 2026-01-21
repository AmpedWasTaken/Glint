import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    .wrap{display:grid;gap:var(--gl-space-2)}
    .label{font-size:var(--gl-text-md);line-height:var(--gl-line-md)}
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
    select{
      all:unset;
      flex:1;
      min-width:0;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
    }
    .chev{width:12px;height:12px;opacity:0.7}
    :host([disabled]){opacity:0.65}
    :host([disabled]) .field{cursor:not-allowed}
    :host([disabled]) select{pointer-events:none}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <select part="select"></select>
      <svg class="chev" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7 10l5 5 5-5z"></path>
      </svg>
    </span>
  </label>
`;

export class GlSelect extends HTMLElement {
  static tagName = "gl-select";
  static get observedAttributes() {
    return ["value", "disabled", "name"];
  }

  #select!: HTMLSelectElement;

  get value() {
    return this.#select?.value ?? this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#select = this.shadowRoot!.querySelector("select")!;

    const optionsAttr = this.getAttribute("options");
    if (optionsAttr) {
      try {
        const parsed = JSON.parse(optionsAttr) as Array<{ value: string; label: string; disabled?: boolean }>;
        for (const opt of parsed) {
          const o = document.createElement("option");
          o.value = opt.value;
          o.textContent = opt.label;
          if (opt.disabled) o.disabled = true;
          this.#select.appendChild(o);
        }
      } catch {
        // ignore
      }
    }

    this.#sync();

    this.#select.addEventListener("change", () => {
      this.setAttribute("value", this.#select.value);
      emit(this, "gl-change", { value: this.#select.value });
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#select) return;
    this.#select.disabled = this.hasAttribute("disabled");
    this.#select.name = this.getAttribute("name") ?? "";
    const v = this.getAttribute("value");
    if (v !== null) this.#select.value = v;
  }
}


