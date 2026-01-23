import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
      width: 100%;
      min-height: 300px;
    }
    .carousel {
      position: relative;
      overflow: hidden;
      border-radius: var(--gl-radius);
      width: 100%;
      height: 100%;
    }
    .carousel-track {
      display: flex;
      transition: transform var(--gl-dur-3) var(--gl-ease-out);
      will-change: transform;
    }
    .carousel-item {
      flex: 0 0 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .carousel-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--gl-dur-1) var(--gl-ease);
      z-index: 10;
      box-shadow: var(--gl-shadow-md);
    }
    .carousel-nav:hover {
      background: var(--gl-hover);
      transform: translateY(-50%) scale(1.1);
    }
    .carousel-nav.prev {
      left: var(--gl-space-4);
    }
    .carousel-nav.next {
      right: var(--gl-space-4);
    }
    .carousel-nav svg {
      width: 20px;
      height: 20px;
    }
    .carousel-indicators {
      position: absolute;
      bottom: var(--gl-space-4);
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: var(--gl-space-2);
      z-index: 10;
    }
    .carousel-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--gl-muted);
      cursor: pointer;
      transition: all var(--gl-dur-1) var(--gl-ease);
      border: 2px solid transparent;
    }
    .carousel-indicator:hover {
      background: var(--gl-fg);
      transform: scale(1.2);
    }
    .carousel-indicator.active {
      background: var(--gl-primary);
      width: 24px;
      border-radius: 4px;
    }
    :host([autoplay]) .carousel-track {
      transition: none;
    }
    :host([variant="fade"]) .carousel-item {
      opacity: 0;
      position: absolute;
      transition: opacity var(--gl-dur-3) var(--gl-ease-out);
    }
    :host([variant="fade"]) .carousel-item.active {
      opacity: 1;
      position: relative;
    }
  </style>
  <div class="carousel" part="carousel">
    <div class="carousel-track" part="track">
      <slot></slot>
    </div>
    <button class="carousel-nav prev" part="nav-prev" aria-label="Previous">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    <button class="carousel-nav next" part="nav-next" aria-label="Next">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
    <div class="carousel-indicators" part="indicators"></div>
  </div>
`;

const itemTemplate = document.createElement("template");
itemTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      flex: 0 0 100%;
      width: 100%;
    }
    .carousel-item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
  <div class="carousel-item" part="item">
    <slot></slot>
  </div>
`;

export class GlCarousel extends HTMLElement {
  static tagName = "gl-carousel";
  static get observedAttributes() {
    return ["current", "variant", "autoplay", "interval"];
  }

  #track!: HTMLElement;
  #prevButton!: HTMLElement;
  #nextButton!: HTMLElement;
  #indicators!: HTMLElement;
  #items: GlCarouselItem[] = [];
  #autoplayTimer?: number;
  #current = 0;

  get current() {
    return this.#current;
  }

  set current(v: number) {
    this.#current = Math.max(0, Math.min(v, this.#items.length - 1));
    this.update();
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#track = this.shadowRoot!.querySelector(".carousel-track") as HTMLElement;
    this.#prevButton = this.shadowRoot!.querySelector(".carousel-nav.prev") as HTMLElement;
    this.#nextButton = this.shadowRoot!.querySelector(".carousel-nav.next") as HTMLElement;
    this.#indicators = this.shadowRoot!.querySelector(".carousel-indicators") as HTMLElement;

    this.#prevButton.addEventListener("click", () => this.previous());
    this.#nextButton.addEventListener("click", () => this.next());

    requestAnimationFrame(() => {
      this.updateItems();
      this.update();
      this.#startAutoplay();
    });
  }

  disconnectedCallback() {
    this.#stopAutoplay();
  }

  attributeChangedCallback(name: string) {
    if (name === "current") {
      this.#current = Number(this.getAttribute("current")) || 0;
      this.update();
    } else if (name === "autoplay") {
      if (this.hasAttribute("autoplay")) {
        this.#startAutoplay();
      } else {
        this.#stopAutoplay();
      }
    }
  }

  updateItems() {
    const slot = this.shadowRoot!.querySelector("slot") as HTMLSlotElement;
    if (!slot) return;

    const assignedNodes = slot.assignedNodes();
    this.#items = assignedNodes.filter(
      (node) => node instanceof GlCarouselItem
    ) as GlCarouselItem[];

    // Update indicators
    this.#indicators.innerHTML = "";
    this.#items.forEach((_, index) => {
      const indicator = document.createElement("div");
      indicator.className = "carousel-indicator";
      if (index === this.#current) indicator.classList.add("active");
      indicator.addEventListener("click", () => {
        this.current = index;
      });
      this.#indicators.appendChild(indicator);
    });
  }

  update() {
    if (this.#items.length === 0) return;

    const variant = this.getAttribute("variant") || "slide";
    
    if (variant === "fade") {
      this.#items.forEach((item, index) => {
        if (index === this.#current) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    } else {
      const translateX = -this.#current * 100;
      this.#track.style.transform = `translateX(${translateX}%)`;
    }

    // Update indicators
    const indicators = this.#indicators.querySelectorAll(".carousel-indicator");
    indicators.forEach((indicator, index) => {
      if (index === this.#current) {
        indicator.classList.add("active");
      } else {
        indicator.classList.remove("active");
      }
    });

    emit(this, "gl-carousel-change", { current: this.#current });
  }

  next() {
    if (this.#items.length === 0) return;
    this.current = (this.#current + 1) % this.#items.length;
  }

  previous() {
    if (this.#items.length === 0) return;
    this.current = (this.#current - 1 + this.#items.length) % this.#items.length;
  }

  goTo(index: number) {
    if (index >= 0 && index < this.#items.length) {
      this.current = index;
    }
  }

  #startAutoplay() {
    this.#stopAutoplay();
    if (this.hasAttribute("autoplay")) {
      const interval = Number(this.getAttribute("interval")) || 3000;
      this.#autoplayTimer = window.setInterval(() => {
        this.next();
      }, interval);
    }
  }

  #stopAutoplay() {
    if (this.#autoplayTimer) {
      clearInterval(this.#autoplayTimer);
      this.#autoplayTimer = undefined;
    }
  }
}

export class GlCarouselItem extends HTMLElement {
  static tagName = "gl-carousel-item";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(itemTemplate.content.cloneNode(true));
    
    const slot = this.shadowRoot!.querySelector("slot");
    if (slot) {
      slot.addEventListener("slotchange", () => {
        const carousel = this.closest("gl-carousel") as GlCarousel;
        if (carousel) {
          carousel.updateItems();
        }
      });
    }
  }
}

