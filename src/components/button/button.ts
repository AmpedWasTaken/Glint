import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block}
    button{
      all:unset;
      box-sizing:border-box;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:var(--gl-space-2);
      border-radius:var(--gl-radius-sm);
      padding:10px 14px;
      font-family:var(--gl-font-sans);
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      cursor:pointer;
      user-select:none;
      background:var(--gl-primary);
      color:var(--gl-primary-fg);
      box-shadow:var(--gl-shadow-sm);
      border:1px solid transparent;
      transition:transform var(--gl-dur-1) var(--gl-ease),
        box-shadow var(--gl-dur-1) var(--gl-ease),
        background var(--gl-dur-1) var(--gl-ease),
        border-color var(--gl-dur-1) var(--gl-ease),
        color var(--gl-dur-1) var(--gl-ease);
    }
    button:focus-visible{outline:2px solid var(--gl-ring);outline-offset:2px}
    button:hover{transform:translateY(-1px);box-shadow:var(--gl-shadow-md)}
    button:active{transform:translateY(0);box-shadow:var(--gl-shadow-sm)}
    button:disabled{opacity:0.55;cursor:not-allowed;transform:none;box-shadow:var(--gl-shadow-sm)}

    :host([variant="secondary"]) button{
      background:var(--gl-panel);
      color:var(--gl-fg);
      border-color:var(--gl-border);
    }
    :host([variant="ghost"]) button{
      background:transparent;
      color:var(--gl-fg);
      box-shadow:none;
    }
    :host([variant="ghost"]) button:hover{background:rgba(2,6,23,0.06)}
    [data-glint-theme="dark"] :host([variant="ghost"]) button:hover{background:rgba(226,232,240,0.08)}
    :host([variant="destructive"]) button{
      background:var(--gl-danger);
      color:var(--gl-danger-fg);
    }

    :host([size="sm"]) button{padding:8px 12px;font-size:var(--gl-text-sm);line-height:var(--gl-line-sm)}
    :host([size="lg"]) button{padding:12px 16px;font-size:var(--gl-text-lg);line-height:var(--gl-line-lg)}
    ::slotted(svg){width:16px;height:16px}
  </style>
  <button part="button" type="button"><slot></slot></button>
`;

export class GlButton extends HTMLElement {
  static tagName = "gl-button";
  static get observedAttributes() {
    return ["disabled", "type"];
  }

  #btn!: HTMLButtonElement;

  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#btn = this.shadowRoot!.querySelector("button")!;
    this.#sync();

    this.#btn.addEventListener("click", (e) => {
      if (this.disabled) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      emit(this, "gl-press");
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#btn) return;
    this.#btn.disabled = this.disabled;
    const type = this.getAttribute("type");
    this.#btn.type = type === "submit" || type === "reset" ? type : "button";
    this.toggleAttribute("aria-disabled", this.disabled);
  }
}
