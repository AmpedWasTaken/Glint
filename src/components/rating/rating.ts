import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-flex}
    .wrap{display:flex;align-items:center;gap:2px}
    .star{
      cursor:pointer;
      color:var(--gl-muted);
      transition:color 0.2s ease, transform 0.15s ease;
      user-select:none;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:2px;
      border-radius:4px;
      position:relative;
    }
    .star:hover{
      transform:scale(1.15);
      color:var(--gl-warning);
    }
    .star.active{
      color:var(--gl-warning);
      filter:drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));
    }
    :host([variant="primary"]) .star.active{color:var(--gl-primary)}
    :host([variant="success"]) .star.active{color:var(--gl-success)}
    :host([variant="danger"]) .star.active{color:var(--gl-danger)}
    .star:focus-visible{
      outline:2px solid var(--gl-ring);
      outline-offset:2px;
    }
    .star.readonly{cursor:default}
    .star.readonly:hover{transform:none;color:var(--gl-muted)}
    :host([disabled]){opacity:0.5;pointer-events:none}
    :host([disabled]) .star{cursor:not-allowed}
    :host([disabled]) .star:hover{transform:none}
    input{position:absolute;opacity:0;pointer-events:none;width:0;height:0}
  </style>
  <div class="wrap" role="radiogroup" part="rating">
    <input type="radio" name="rating" value="0" checked aria-hidden="true">
  </div>
`;

export class GlRating extends HTMLElement {
  static tagName = "gl-rating";
  static get observedAttributes() {
    return ["value", "max", "readonly", "disabled", "size", "variant"];
  }

  #container!: HTMLDivElement;
  #stars: HTMLSpanElement[] = [];
  #max = 5;
  #value = 0;

  get value() {
    return this.#value;
  }
  set value(v: number) {
    const clamped = Math.max(0, Math.min(this.#max, Math.round(v)));
    if (clamped !== this.#value) {
      this.#value = clamped;
      this.setAttribute("value", String(clamped));
      this.#updateStars();
    }
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#container = this.shadowRoot!.querySelector(".wrap") as HTMLDivElement;
    this.#max = Number(this.getAttribute("max")) || 5;
    this.#value = Number(this.getAttribute("value")) || 0;
    this.#buildStars();
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #buildStars() {
    this.#stars = [];
    for (let i = 1; i <= this.#max; i++) {
      const star = document.createElement("span");
      star.className = "star";
      star.setAttribute("role", "radio");
      star.setAttribute("aria-label", `Rate ${i} out of ${this.#max}`);
      star.setAttribute("tabindex", "0");
      star.textContent = "★";
      star.dataset.value = String(i);
      
      star.addEventListener("click", () => {
        if (!this.hasAttribute("disabled") && !this.hasAttribute("readonly")) {
          this.value = i;
          emit(this, "gl-change", { value: this.#value });
        }
      });
      
      star.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!this.hasAttribute("disabled") && !this.hasAttribute("readonly")) {
            this.value = i;
            emit(this, "gl-change", { value: this.#value });
          }
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          const next = Math.min(this.#max, i + 1);
          this.#focusStar(next);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          const prev = Math.max(1, i - 1);
          this.#focusStar(prev);
        }
      });

      this.#container.appendChild(star);
      this.#stars.push(star);
    }
  }

  #focusStar(index: number) {
    if (index >= 1 && index <= this.#max) {
      const star = this.#stars[index - 1];
      if (star) star.focus();
    }
  }

  #updateStars() {
    this.#stars.forEach((star, index) => {
      const value = index + 1;
      const isActive = value <= this.#value;
      star.classList.toggle("active", isActive);
      star.setAttribute("aria-checked", String(isActive));
      star.setAttribute("tabindex", value === this.#value ? "0" : "-1");
    });
  }

  #sync() {
    const max = Number(this.getAttribute("max"));
    if (max && max !== this.#max && max > 0 && max <= 10) {
      this.#max = max;
      this.#container.innerHTML = "";
      this.#buildStars();
    }
    
    const value = Number(this.getAttribute("value"));
    if (!isNaN(value) && value !== this.#value) {
      this.#value = Math.max(0, Math.min(this.#max, Math.round(value)));
      this.#updateStars();
    }

    const readonly = this.hasAttribute("readonly");
    const disabled = this.hasAttribute("disabled");
    this.#stars.forEach(star => {
      star.classList.toggle("readonly", readonly);
      star.setAttribute("aria-disabled", String(disabled || readonly));
    });

    const size = this.getAttribute("size");
    if (size) {
      const sizeMap: Record<string, string> = {
        sm: "16px",
        md: "20px",
        lg: "24px"
      };
      const fontSize = sizeMap[size] || "20px";
      this.#container.style.fontSize = fontSize;
    } else {
      this.#container.style.fontSize = "";
    }
  }
}

