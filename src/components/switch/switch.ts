import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block}
    :host{--gl-switch-dur:var(--gl-dur-2);--gl-switch-ease:var(--gl-ease-spring);--gl-switch-amp:1}
    :host([motion="none"]){--gl-switch-dur:0ms}
    :host([motion="subtle"]){--gl-switch-dur:var(--gl-dur-3);--gl-switch-ease:var(--gl-ease-out);--gl-switch-amp:0.7}
    :host([motion="snappy"]){--gl-switch-dur:var(--gl-dur-2);--gl-switch-ease:var(--gl-ease-spring);--gl-switch-amp:1}
    :host([motion="bounce"]){--gl-switch-dur:var(--gl-dur-4);--gl-switch-ease:var(--gl-ease-bounce);--gl-switch-amp:1.15}
    .switch{
      position:relative;
      display:inline-block;
      width:44px;
      height:24px;
      cursor:pointer;
      -webkit-tap-highlight-color:transparent;
    }
    .track{
      position:absolute;
      inset:0;
      background:var(--gl-border);
      border-radius:12px;
      transition:background var(--gl-switch-dur) var(--gl-switch-ease);
    }
    :host([checked]) .track{background:var(--gl-primary)}
    .thumb{
      position:absolute;
      top:2px;
      left:2px;
      width:20px;
      height:20px;
      background:var(--gl-panel);
      border-radius:50%;
      box-shadow:var(--gl-shadow-sm);
      transition:transform var(--gl-switch-dur) var(--gl-switch-ease), box-shadow var(--gl-switch-dur) var(--gl-switch-ease);
      transform:translateX(0);
    }
    :host([checked]) .thumb{transform:translateX(20px)}
    :host([motion="snappy"][checked]) .thumb{transform:translateX(20px) scale(1.1)}
    :host([motion="bounce"][checked]) .thumb{transform:translateX(20px) scale(1.15)}
    :host(:hover) .thumb{box-shadow:var(--gl-shadow-md)}
    :host([disabled]){opacity:0.5;cursor:not-allowed;pointer-events:none}
    :host([size="sm"]) .switch{width:36px;height:20px}
    :host([size="sm"]) .thumb{width:16px;height:16px;top:2px;left:2px}
    :host([size="sm"][checked]) .thumb{transform:translateX(16px)}
    :host([size="lg"]) .switch{width:52px;height:28px}
    :host([size="lg"]) .thumb{width:24px;height:24px;top:2px;left:2px}
    :host([size="lg"][checked]) .thumb{transform:translateX(24px)}
    .wrap{display:inline-flex;align-items:center;gap:var(--gl-space-2)}
    .label{font-size:var(--gl-text-md);line-height:var(--gl-line-md);color:var(--gl-fg);cursor:pointer;user-select:none}
    .desc{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm);color:var(--gl-muted);margin-top:2px}
    :host([disabled]) .label{cursor:not-allowed}
  </style>
  <div class="wrap" part="wrap">
    <div part="switch" class="switch" role="switch" tabindex="0" aria-checked="false">
      <div part="track" class="track"></div>
      <div part="thumb" class="thumb"></div>
    </div>
    <div part="label-wrap">
      <div class="label" part="label"><slot name="label"></slot></div>
      <div class="desc" part="description"><slot name="description"></slot></div>
    </div>
  </div>
`;

export class GlSwitch extends HTMLElement {
  static tagName = "gl-switch";
  static get observedAttributes() {
    return ["checked", "disabled", "size"];
  }

  #switch!: HTMLDivElement;

  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(v: boolean) {
    if (v) this.setAttribute("checked", "");
    else this.removeAttribute("checked");
  }

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
    this.#switch = this.shadowRoot!.querySelector(".switch") as HTMLDivElement;
    const label = this.shadowRoot!.querySelector(".label") as HTMLElement;
    this.#sync();
    const handleClick = () => this.toggle();
    this.#switch.addEventListener("click", handleClick);
    if (label) label.addEventListener("click", handleClick);
    this.#switch.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    emit(this, "gl-change", { checked: this.checked });
  }

  #sync() {
    if (!this.#switch) return;
    this.#switch.setAttribute("aria-checked", String(this.checked));
    this.#switch.setAttribute("aria-disabled", String(this.disabled));
    if (this.disabled) {
      this.#switch.setAttribute("tabindex", "-1");
    } else {
      this.#switch.setAttribute("tabindex", "0");
    }
  }
}

