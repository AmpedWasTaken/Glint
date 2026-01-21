import { emit } from "../../internal/events.js";
import { createFocusTrap } from "../../internal/focus.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:contents}
    :host{--gl-motion-dur:var(--gl-dur-2);--gl-motion-ease:var(--gl-ease-spring);--gl-motion-amp:1}
    :host([motion="none"]){--gl-motion-dur:0ms}
    :host([motion="subtle"]){--gl-motion-dur:var(--gl-dur-3);--gl-motion-ease:var(--gl-ease-out);--gl-motion-amp:0.7}
    :host([motion="snappy"]){--gl-motion-dur:var(--gl-dur-2);--gl-motion-ease:var(--gl-ease-spring);--gl-motion-amp:1}
    :host([motion="bounce"]){--gl-motion-dur:var(--gl-dur-4);--gl-motion-ease:var(--gl-ease-bounce);--gl-motion-amp:1.15}
    .overlay{
      position:fixed;
      inset:0;
      background:var(--gl-overlay);
      z-index:var(--gl-z-modal);
      display:none;
      align-items:center;
      justify-content:center;
      padding:var(--gl-space-5);
      opacity:0;
      transition:opacity var(--gl-motion-dur) var(--gl-motion-ease);
    }
    :host([open]) .overlay{
      display:flex;
      animation:gl-fade-in var(--gl-motion-dur) var(--gl-motion-ease) forwards;
    }
    :host(:not([open])) .overlay{
      animation:gl-fade-out var(--gl-fade-out-dur) var(--gl-ease-out) forwards;
    }
    .dialog{
      width:min(560px, 100%);
      background:var(--gl-panel);
      color:var(--gl-fg);
      border:1px solid var(--gl-border);
      border-radius:var(--gl-radius-lg);
      box-shadow:var(--gl-shadow-md);
      overflow:hidden;
      transform:translateY(calc(var(--gl-enter-y) * var(--gl-motion) * var(--gl-motion-amp))) scale(calc(1 - ((1 - var(--gl-enter-scale)) * var(--gl-motion) * var(--gl-motion-amp))));
      opacity:0;
      transition:opacity var(--gl-motion-dur) var(--gl-motion-ease), transform var(--gl-motion-dur) var(--gl-motion-ease);
      outline:none;
    }
    :host([open]) .dialog{
      opacity:1;
      transform:translateY(0) scale(1);
      animation:gl-scale-in var(--gl-motion-dur) var(--gl-motion-ease) forwards;
    }
    :host(:not([open])) .dialog{
      animation:gl-scale-out var(--gl-scale-out-dur) var(--gl-ease-out) forwards;
    }
    .header{padding:var(--gl-space-4) var(--gl-space-4) 0}
    .body{padding:var(--gl-space-4)}
    .footer{padding:0 var(--gl-space-4) var(--gl-space-4); display:flex; justify-content:flex-end; gap:var(--gl-space-2)}
    .header:empty,.footer:empty{display:none}
  </style>
  <div class="overlay" part="overlay">
    <div class="dialog" part="dialog" role="dialog" aria-modal="true" tabindex="-1">
      <div class="header" part="header"><slot name="header"></slot></div>
      <div class="body" part="body"><slot></slot></div>
      <div class="footer" part="footer"><slot name="footer"></slot></div>
    </div>
  </div>
`;

export class GlModal extends HTMLElement {
  static tagName = "gl-modal";
  static get observedAttributes() {
    return ["open", "label", "describedby"];
  }

  #overlay!: HTMLDivElement;
  #dialog!: HTMLDivElement;
  #trap = createFocusTrap(document.createElement("div"));

  get open() {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    if (v) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#overlay = this.shadowRoot!.querySelector(".overlay") as HTMLDivElement;
    this.#dialog = this.shadowRoot!.querySelector(".dialog") as HTMLDivElement;
    this.#trap = createFocusTrap(this.#dialog);
    this.#sync();

    this.#overlay.addEventListener("mousedown", (e) => {
      if (e.target === this.#overlay) this.close("backdrop");
    });
    this.addEventListener("keydown", (e) => {
      if (!this.open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this.close("escape");
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  show() {
    if (this.open) return;
    this.open = true;
  }

  close(reason: "escape" | "backdrop" | "api" = "api") {
    if (!this.open) return;
    this.open = false;
    emit(this, "gl-close", { reason });
  }

  #sync() {
    if (!this.#dialog) return;
    const label = this.getAttribute("label");
    const describedby = this.getAttribute("describedby");
    if (label) this.#dialog.setAttribute("aria-label", label);
    if (describedby) this.#dialog.setAttribute("aria-describedby", describedby);

    if (this.open) {
      this.#trap.activate();
      emit(this, "gl-open");
    } else {
      this.#trap.deactivate();
    }
  }
}
