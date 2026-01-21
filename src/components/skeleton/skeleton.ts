const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    .skeleton{
      background:var(--gl-panel);
      border-radius:var(--gl-radius-sm);
      position:relative;
      overflow:hidden;
    }
    .skeleton::after{
      content:"";
      position:absolute;
      inset:0;
      background:linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--gl-bg) 40%, transparent),
        transparent
      );
      animation:gl-skeleton-shimmer 1.5s ease-in-out infinite;
    }
    :host([variant="pulse"]) .skeleton::after{
      background:color-mix(in srgb, var(--gl-bg) 30%, transparent);
      animation:gl-skeleton-pulse 1.5s ease-in-out infinite;
    }
    :host([variant="wave"]) .skeleton::after{
      background:linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--gl-bg) 50%, transparent) 50%,
        transparent 100%
      );
      animation:gl-skeleton-wave 1.2s ease-in-out infinite;
    }
    :host([variant="none"]) .skeleton::after{display:none}
    :host([shape="circle"]) .skeleton{border-radius:50%}
    :host([shape="rect"]) .skeleton{border-radius:var(--gl-radius-sm)}
    :host([shape="text"]) .skeleton{border-radius:4px}
    @keyframes gl-skeleton-shimmer{
      0%{transform:translateX(-100%)}
      100%{transform:translateX(100%)}
    }
    @keyframes gl-skeleton-pulse{
      0%,100%{opacity:1}
      50%{opacity:0.5}
    }
    @keyframes gl-skeleton-wave{
      0%{transform:translateX(-100%) skewX(-15deg)}
      100%{transform:translateX(200%) skewX(-15deg)}
    }
    @media (prefers-reduced-motion: reduce) {
      .skeleton::after{animation:none}
    }
  </style>
  <div part="skeleton" class="skeleton"></div>
`;

export class GlSkeleton extends HTMLElement {
  static tagName = "gl-skeleton";
  static get observedAttributes() {
    return ["width", "height", "variant", "shape"];
  }

  #skeleton!: HTMLDivElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#skeleton = this.shadowRoot!.querySelector(".skeleton") as HTMLDivElement;
    this.#update();
  }

  attributeChangedCallback() {
    this.#update();
  }

  #update() {
    if (!this.#skeleton) return;
    const width = this.getAttribute("width") || "100%";
    const height = this.getAttribute("height") || "20px";
    this.#skeleton.style.width = width;
    this.#skeleton.style.height = height;
  }
}

