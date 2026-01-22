const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      position: relative;
    }
    .pane {
      flex: 1;
      overflow: auto;
      position: relative;
    }
    .pane:first-child {
      min-width: 0;
    }
    .pane:last-child {
      min-width: 0;
    }
    .divider {
      width: 4px;
      background: var(--gl-border);
      cursor: col-resize;
      position: relative;
      flex-shrink: 0;
      transition: background var(--gl-dur-1) var(--gl-ease);
    }
    .divider:hover {
      background: var(--gl-primary);
    }
    .divider::before {
      content: "";
      position: absolute;
      inset: -4px;
    }
    :host([orientation="vertical"]) {
      flex-direction: column;
    }
    :host([orientation="vertical"]) .divider {
      width: 100%;
      height: 4px;
      cursor: row-resize;
    }
    :host([orientation="vertical"]) .pane {
      min-height: 0;
    }
    .handle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--gl-dur-1) var(--gl-ease);
    }
    .divider:hover .handle {
      opacity: 1;
    }
    :host([orientation="vertical"]) .handle {
      top: 50%;
      left: 50%;
    }
    .handle-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--gl-muted);
    }
    .handle-dot + .handle-dot {
      margin-left: 2px;
    }
    :host([disabled]) .divider {
      cursor: default;
      pointer-events: none;
    }
  </style>
  <div class="pane" part="pane-first">
    <slot name="first"></slot>
  </div>
  <div class="divider" part="divider">
    <div class="handle" part="handle">
      <div class="handle-dot"></div>
      <div class="handle-dot"></div>
      <div class="handle-dot"></div>
    </div>
  </div>
  <div class="pane" part="pane-second">
    <slot name="second"></slot>
  </div>
`;

export class GlSplitPane extends HTMLElement {
  static tagName = "gl-split-pane";
  static get observedAttributes() {
    return ["orientation", "split", "disabled"];
  }

  #divider!: HTMLElement;
  #firstPane!: HTMLElement;
  #secondPane!: HTMLElement;
  #isDragging = false;
  #startPos = 0;
  #startSize = 0;

  get split() {
    return Number(this.getAttribute("split")) || 50;
  }
  set split(v: number) {
    this.setAttribute("split", String(Math.max(0, Math.min(100, v))));
  }

  get orientation() {
    return this.getAttribute("orientation") || "horizontal";
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#divider = this.shadowRoot!.querySelector(".divider") as HTMLElement;
    this.#firstPane = this.shadowRoot!.querySelector(".pane:first-child") as HTMLElement;
    this.#secondPane = this.shadowRoot!.querySelector(".pane:last-child") as HTMLElement;

    this.#updateSplit();
    this.#setupDrag();
  }

  attributeChangedCallback(name: string) {
    if (name === "split") {
      this.#updateSplit();
    }
  }

  #updateSplit() {
    const split = this.split;
    if (this.orientation === "horizontal") {
      this.#firstPane.style.width = `${split}%`;
      this.#secondPane.style.width = `${100 - split}%`;
    } else {
      this.#firstPane.style.height = `${split}%`;
      this.#secondPane.style.height = `${100 - split}%`;
    }
  }

  #setupDrag() {
    this.#divider.addEventListener("mousedown", (e) => {
      if (this.hasAttribute("disabled")) return;
      e.preventDefault();
      e.stopPropagation();
      this.#isDragging = true;
      const rect = this.getBoundingClientRect();
      if (this.orientation === "horizontal") {
        this.#startPos = e.clientX;
        this.#startSize = rect.width;
      } else {
        this.#startPos = e.clientY;
        this.#startSize = rect.height;
      }
      document.addEventListener("mousemove", this.#handleDrag, { passive: false });
      document.addEventListener("mouseup", this.#handleDragEnd, { once: true });
      document.body.style.userSelect = "none";
      document.body.style.cursor = this.orientation === "horizontal" ? "col-resize" : "row-resize";
    });
  }

  #handleDrag = (e: MouseEvent) => {
    if (!this.#isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = this.getBoundingClientRect();
    let newSplit = 0;
    if (this.orientation === "horizontal") {
      const delta = e.clientX - this.#startPos;
      newSplit = ((this.split * this.#startSize) / 100 + delta) / this.#startSize * 100;
    } else {
      const delta = e.clientY - this.#startPos;
      newSplit = ((this.split * this.#startSize) / 100 + delta) / this.#startSize * 100;
    }
    this.split = Math.max(10, Math.min(90, newSplit));
  };

  #handleDragEnd = () => {
    this.#isDragging = false;
    document.removeEventListener("mousemove", this.#handleDrag);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };
}

