import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
    }
    :host([dragging]) {
      cursor: grabbing;
      user-select: none;
    }
    :host([draggable]:not([disabled])) {
      cursor: grab;
    }
    :host([disabled]) {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .drag-handle {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      pointer-events: none;
    }
    :host([handle]) .drag-handle {
      pointer-events: auto;
    }
    .drag-handle-slot {
      pointer-events: auto;
    }
  </style>
  <slot name="handle" class="drag-handle-slot"></slot>
  <div class="drag-handle" part="handle"></div>
  <slot></slot>
`;

export class GlDraggable extends HTMLElement {
  static tagName = "gl-draggable";
  static get observedAttributes() {
    return ["draggable", "disabled", "handle", "axis", "bounds"];
  }

  #isDragging = false;
  #startX = 0;
  #startY = 0;
  #startLeft = 0;
  #startTop = 0;
  #handle?: HTMLElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#handle = this.shadowRoot!.querySelector(".drag-handle") as HTMLElement;
    
    this.addEventListener("mousedown", (e) => this.#startDrag(e));
    document.addEventListener("mousemove", (e) => this.#drag(e));
    document.addEventListener("mouseup", () => this.#stopDrag());

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const draggable = this.hasAttribute("draggable");
    const disabled = this.hasAttribute("disabled");
    const hasHandle = this.hasAttribute("handle");

    if (draggable && !disabled) {
      this.style.position = "relative";
      this.style.touchAction = "none";
    }
  }

  #startDrag(e: MouseEvent) {
    if (this.hasAttribute("disabled") || !this.hasAttribute("draggable")) return;

    const hasHandle = this.hasAttribute("handle");
    if (hasHandle) {
      const handleSlot = this.shadowRoot!.querySelector('slot[name="handle"]') as HTMLSlotElement;
      const assignedElements = handleSlot?.assignedElements();
      const clickedElement = e.target as HTMLElement;
      
      if (assignedElements.length > 0) {
        const isHandleClick = assignedElements.some(el => 
          el.contains(clickedElement) || el === clickedElement
        );
        if (!isHandleClick) return;
      } else {
        if (!this.#handle?.contains(clickedElement) && clickedElement !== this.#handle) {
          return;
        }
      }
    }

    e.preventDefault();
    this.#isDragging = true;
    this.#startX = e.clientX;
    this.#startY = e.clientY;
    
    const rect = this.getBoundingClientRect();
    this.#startLeft = rect.left;
    this.#startTop = rect.top;

    this.setAttribute("dragging", "");
    emit(this, "gl-drag-start", { x: this.#startLeft, y: this.#startTop });
  }

  #drag(e: MouseEvent) {
    if (!this.#isDragging) return;

    const axis = this.getAttribute("axis") || "both";
    const bounds = this.getAttribute("bounds");
    
    let deltaX = e.clientX - this.#startX;
    let deltaY = e.clientY - this.#startY;

    if (axis === "x") deltaY = 0;
    if (axis === "y") deltaX = 0;

    let newLeft = this.#startLeft + deltaX;
    let newTop = this.#startTop + deltaY;

    if (bounds) {
      const boundsEl = document.querySelector(bounds);
      if (boundsEl) {
        const boundsRect = boundsEl.getBoundingClientRect();
        const thisRect = this.getBoundingClientRect();
        newLeft = Math.max(boundsRect.left, Math.min(boundsRect.right - thisRect.width, newLeft));
        newTop = Math.max(boundsRect.top, Math.min(boundsRect.bottom - thisRect.height, newTop));
      }
    }

    this.style.left = `${newLeft}px`;
    this.style.top = `${newTop}px`;
    this.style.position = "fixed";

    emit(this, "gl-drag", { x: newLeft, y: newTop, deltaX, deltaY });
  }

  #stopDrag() {
    if (!this.#isDragging) return;

    this.#isDragging = false;
    this.removeAttribute("dragging");
    
    const rect = this.getBoundingClientRect();
    emit(this, "gl-drag-end", { x: rect.left, y: rect.top });
  }

  get draggable() {
    return this.hasAttribute("draggable");
  }

  set draggable(v: boolean) {
    if (v) this.setAttribute("draggable", "");
    else this.removeAttribute("draggable");
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }
}
