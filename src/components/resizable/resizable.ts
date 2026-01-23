import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
    }
    .resizable-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-width: var(--gl-resizable-min-width, 100px);
      min-height: var(--gl-resizable-min-height, 100px);
    }
    .resizable-handle {
      position: absolute;
      background: transparent;
      z-index: 10;
      transition: background var(--gl-dur-1) var(--gl-ease);
    }
    .resizable-handle:hover {
      background: var(--gl-primary);
      opacity: 0.3;
    }
    .resizable-handle[data-direction="right"],
    .resizable-handle[data-direction="left"] {
      top: 0;
      bottom: 0;
      width: 4px;
      cursor: ew-resize;
    }
    .resizable-handle[data-direction="right"] {
      right: 0;
    }
    .resizable-handle[data-direction="left"] {
      left: 0;
    }
    .resizable-handle[data-direction="bottom"],
    .resizable-handle[data-direction="top"] {
      left: 0;
      right: 0;
      height: 4px;
      cursor: ns-resize;
    }
    .resizable-handle[data-direction="bottom"] {
      bottom: 0;
    }
    .resizable-handle[data-direction="top"] {
      top: 0;
    }
    .resizable-handle[data-direction="bottom-right"],
    .resizable-handle[data-direction="bottom-left"],
    .resizable-handle[data-direction="top-right"],
    .resizable-handle[data-direction="top-left"] {
      width: 12px;
      height: 12px;
      cursor: nwse-resize;
    }
    .resizable-handle[data-direction="bottom-right"] {
      bottom: 0;
      right: 0;
      cursor: nwse-resize;
    }
    .resizable-handle[data-direction="bottom-left"] {
      bottom: 0;
      left: 0;
      cursor: nesw-resize;
    }
    .resizable-handle[data-direction="top-right"] {
      top: 0;
      right: 0;
      cursor: nesw-resize;
    }
    .resizable-handle[data-direction="top-left"] {
      top: 0;
      left: 0;
      cursor: nwse-resize;
    }
    .resizable-handle[data-resizing] {
      background: var(--gl-primary);
      opacity: 0.5;
    }
  </style>
  <div class="resizable-container" part="container">
    <slot></slot>
    <div class="resizable-handle" part="handle" data-direction="right"></div>
    <div class="resizable-handle" part="handle" data-direction="bottom"></div>
    <div class="resizable-handle" part="handle" data-direction="bottom-right"></div>
  </div>
`;

export class GlResizable extends HTMLElement {
  static tagName = "gl-resizable";
  static get observedAttributes() {
    return ["disabled", "directions", "min-width", "min-height", "max-width", "max-height"];
  }

  #container!: HTMLElement;
  #handles!: NodeListOf<HTMLElement>;
  #isResizing = false;
  #startX = 0;
  #startY = 0;
  #startWidth = 0;
  #startHeight = 0;
  #direction = "";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#container = this.shadowRoot!.querySelector(".resizable-container") as HTMLElement;
    this.#handles = this.shadowRoot!.querySelectorAll(".resizable-handle") as NodeListOf<HTMLElement>;

    this.#handles.forEach(handle => {
      handle.addEventListener("mousedown", (e) => this.#startResize(e, handle));
    });

    document.addEventListener("mousemove", (e) => this.#resize(e));
    document.addEventListener("mouseup", () => this.#stopResize());

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const disabled = this.hasAttribute("disabled");
    const directions = this.getAttribute("directions") || "right,bottom,bottom-right";
    const allowedDirections = directions.split(",").map(d => d.trim());

    this.#handles.forEach(handle => {
      const direction = handle.getAttribute("data-direction") || "";
      if (disabled || !allowedDirections.includes(direction)) {
        handle.style.display = "none";
      } else {
        handle.style.display = "block";
      }
    });

    const minWidth = this.getAttribute("min-width");
    const minHeight = this.getAttribute("min-height");
    const maxWidth = this.getAttribute("max-width");
    const maxHeight = this.getAttribute("max-height");

    if (minWidth) this.style.setProperty("--gl-resizable-min-width", minWidth);
    if (minHeight) this.style.setProperty("--gl-resizable-min-height", minHeight);
  }

  #startResize(e: MouseEvent, handle: HTMLElement) {
    e.preventDefault();
    if (this.hasAttribute("disabled")) return;

    this.#isResizing = true;
    this.#direction = handle.getAttribute("data-direction") || "";
    this.#startX = e.clientX;
    this.#startY = e.clientY;
    this.#startWidth = this.offsetWidth;
    this.#startHeight = this.offsetHeight;

    handle.setAttribute("data-resizing", "");
    this.setAttribute("data-resizing", "");
    emit(this, "gl-resize-start");
  }

  #resize(e: MouseEvent) {
    if (!this.#isResizing) return;

    const minWidth = parseInt(this.getAttribute("min-width") || "100", 10);
    const minHeight = parseInt(this.getAttribute("min-height") || "100", 10);
    const maxWidth = this.getAttribute("max-width") ? parseInt(this.getAttribute("max-width")!, 10) : Infinity;
    const maxHeight = this.getAttribute("max-height") ? parseInt(this.getAttribute("max-height")!, 10) : Infinity;

    let newWidth = this.#startWidth;
    let newHeight = this.#startHeight;

    if (this.#direction.includes("right")) {
      newWidth = Math.min(maxWidth, Math.max(minWidth, this.#startWidth + (e.clientX - this.#startX)));
    }
    if (this.#direction.includes("left")) {
      newWidth = Math.min(maxWidth, Math.max(minWidth, this.#startWidth - (e.clientX - this.#startX)));
    }
    if (this.#direction.includes("bottom")) {
      newHeight = Math.min(maxHeight, Math.max(minHeight, this.#startHeight + (e.clientY - this.#startY)));
    }
    if (this.#direction.includes("top")) {
      newHeight = Math.min(maxHeight, Math.max(minHeight, this.#startHeight - (e.clientY - this.#startY)));
    }

    this.style.width = `${newWidth}px`;
    this.style.height = `${newHeight}px`;

    emit(this, "gl-resize", { width: newWidth, height: newHeight });
  }

  #stopResize() {
    if (!this.#isResizing) return;

    this.#isResizing = false;
    this.#handles.forEach(handle => handle.removeAttribute("data-resizing"));
    this.removeAttribute("data-resizing");
    emit(this, "gl-resize-end");
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }
}
