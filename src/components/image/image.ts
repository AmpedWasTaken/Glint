const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;
    }
    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--gl-hover);
    }
    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity var(--gl-dur-2) var(--gl-ease);
    }
    .image[data-loading] {
      opacity: 0;
    }
    .image[data-loaded] {
      opacity: 1;
    }
    .image-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gl-hover);
      color: var(--gl-muted);
      font-size: var(--gl-text-sm);
    }
    .image-error {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--gl-hover);
      color: var(--gl-muted);
      font-size: var(--gl-text-sm);
      gap: var(--gl-space-2);
    }
    .image-error-icon {
      width: 32px;
      height: 32px;
      opacity: 0.5;
    }
    :host([fit="contain"]) .image {
      object-fit: contain;
    }
    :host([fit="cover"]) .image {
      object-fit: cover;
    }
    :host([fit="fill"]) .image {
      object-fit: fill;
    }
    :host([fit="none"]) .image {
      object-fit: none;
    }
    :host([fit="scale-down"]) .image {
      object-fit: scale-down;
    }
    :host([rounded]) .image-container {
      border-radius: var(--gl-radius);
    }
    :host([rounded="sm"]) .image-container {
      border-radius: var(--gl-radius-sm);
    }
    :host([rounded="lg"]) .image-container {
      border-radius: var(--gl-radius-lg);
    }
    :host([rounded="full"]) .image-container {
      border-radius: 50%;
    }
  </style>
  <div class="image-container" part="container">
    <img class="image" part="image" alt="" />
    <div class="image-placeholder" part="placeholder" style="display: none;">
      <slot name="placeholder">Loading...</slot>
    </div>
    <div class="image-error" part="error" style="display: none;">
      <svg class="image-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      <slot name="error">Failed to load image</slot>
    </div>
  </div>
`;

export class GlImage extends HTMLElement {
  static tagName = "gl-image";
  static get observedAttributes() {
    return ["src", "alt", "lazy", "fit", "rounded", "width", "height"];
  }

  #img!: HTMLImageElement;
  #placeholder!: HTMLElement;
  #error!: HTMLElement;
  #observer?: IntersectionObserver;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#img = this.shadowRoot!.querySelector(".image") as HTMLImageElement;
    this.#placeholder = this.shadowRoot!.querySelector(".image-placeholder") as HTMLElement;
    this.#error = this.shadowRoot!.querySelector(".image-error") as HTMLElement;

    this.#img.addEventListener("load", () => this.#onLoad());
    this.#img.addEventListener("error", () => this.#onError());

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  disconnectedCallback() {
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = undefined;
    }
  }

  #sync() {
    const src = this.getAttribute("src");
    const alt = this.getAttribute("alt") || "";
    const lazy = this.hasAttribute("lazy");
    const width = this.getAttribute("width");
    const height = this.getAttribute("height");

    this.#img.setAttribute("alt", alt);

    if (width) {
      this.#img.setAttribute("width", width);
      this.style.width = width.includes("px") || width.includes("%") ? width : `${width}px`;
    }
    if (height) {
      this.#img.setAttribute("height", height);
      this.style.height = height.includes("px") || height.includes("%") ? height : `${height}px`;
    }

    if (!src) {
      this.#showError();
      return;
    }

    if (lazy) {
      this.#loadLazy(src);
    } else {
      this.#loadImage(src);
    }
  }

  #loadImage(src: string) {
    this.#img.setAttribute("data-loading", "");
    this.#placeholder.style.display = "flex";
    this.#error.style.display = "none";
    this.#img.src = src;
  }

  #loadLazy(src: string) {
    if (!("IntersectionObserver" in window)) {
      this.#loadImage(src);
      return;
    }

    this.#img.setAttribute("data-loading", "");
    this.#placeholder.style.display = "flex";
    this.#error.style.display = "none";

    if (this.#observer) {
      this.#observer.disconnect();
    }

    this.#observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.#img.src = src;
          this.#observer?.disconnect();
          this.#observer = undefined;
        }
      });
    });

    this.#observer.observe(this);
  }

  #onLoad() {
    this.#img.setAttribute("data-loaded", "");
    this.#img.removeAttribute("data-loading");
    this.#placeholder.style.display = "none";
    this.#error.style.display = "none";
    this.dispatchEvent(new CustomEvent("gl-image-load"));
  }

  #onError() {
    const fallback = this.getAttribute("fallback");
    if (fallback && this.#img.src !== fallback) {
      this.#img.src = fallback;
      return;
    }
    this.#showError();
  }

  #showError() {
    this.#img.removeAttribute("data-loading");
    this.#img.removeAttribute("data-loaded");
    this.#placeholder.style.display = "none";
    this.#error.style.display = "flex";
    this.dispatchEvent(new CustomEvent("gl-image-error"));
  }

  get src() {
    return this.getAttribute("src") || "";
  }

  set src(v: string) {
    this.setAttribute("src", v);
  }

  get alt() {
    return this.getAttribute("alt") || "";
  }

  set alt(v: string) {
    this.setAttribute("alt", v);
  }

  get lazy() {
    return this.hasAttribute("lazy");
  }

  set lazy(v: boolean) {
    if (v) this.setAttribute("lazy", "");
    else this.removeAttribute("lazy");
  }
}

