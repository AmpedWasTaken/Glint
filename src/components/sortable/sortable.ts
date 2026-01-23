import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    ::slotted(*) {
      transition: transform var(--gl-dur-1) var(--gl-ease);
    }
    ::slotted([data-dragging]) {
      opacity: 0.5;
      z-index: 1000;
      pointer-events: none;
    }
    ::slotted([data-drag-over]) {
      border-top: 2px solid var(--gl-primary);
    }
  </style>
  <slot></slot>
`;

export class GlSortable extends HTMLElement {
  static tagName = "gl-sortable";
  static get observedAttributes() {
    return ["disabled", "handle"];
  }

  #items: HTMLElement[] = [];
  #draggedItem?: HTMLElement;
  #dragOverItem?: HTMLElement;
  #startY = 0;
  #startX = 0;
  #currentY = 0;
  #currentX = 0;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#updateItems();
    
    const observer = new MutationObserver(() => {
      this.#updateItems();
    });
    observer.observe(this, { childList: true, subtree: true });

    this.addEventListener("mousedown", (e) => this.#startDrag(e));
    document.addEventListener("mousemove", (e) => this.#drag(e));
    document.addEventListener("mouseup", () => this.#stopDrag());
  }

  attributeChangedCallback() {
    this.#updateItems();
  }

  #updateItems() {
    this.#items = Array.from(this.children) as HTMLElement[];
    this.#items.forEach((item, index) => {
      item.setAttribute("data-sortable-index", String(index));
    });
  }

  #startDrag(e: MouseEvent) {
    if (this.hasAttribute("disabled")) return;

    const target = e.target as HTMLElement;
    const item = target.closest("[data-sortable-index]") as HTMLElement;
    if (!item) return;

    const hasHandle = this.hasAttribute("handle");
    if (hasHandle) {
      const handleSelector = this.getAttribute("handle") || "[data-sortable-handle]";
      const handle = target.closest(handleSelector);
      if (!handle) return;
    }

    e.preventDefault();
    this.#draggedItem = item;
    this.#startY = e.clientY;
    this.#startX = e.clientX;
    
    item.setAttribute("data-dragging", "");
    item.style.cursor = "grabbing";
    
    emit(this, "gl-sort-start", { item, index: parseInt(item.getAttribute("data-sortable-index") || "0", 10) });
  }

  #drag(e: MouseEvent) {
    if (!this.#draggedItem) return;

    this.#currentY = e.clientY;
    this.#currentX = e.clientX;

    const dragOverItem = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-sortable-index]") as HTMLElement;
    
    if (dragOverItem && dragOverItem !== this.#draggedItem) {
      if (this.#dragOverItem) {
        this.#dragOverItem.removeAttribute("data-drag-over");
      }
      this.#dragOverItem = dragOverItem;
      dragOverItem.setAttribute("data-drag-over", "");
    } else if (!dragOverItem && this.#dragOverItem) {
      this.#dragOverItem.removeAttribute("data-drag-over");
      this.#dragOverItem = undefined;
    }
  }

  #stopDrag() {
    if (!this.#draggedItem) return;

    const oldIndex = parseInt(this.#draggedItem.getAttribute("data-sortable-index") || "0", 10);
    let newIndex = oldIndex;

    if (this.#dragOverItem) {
      newIndex = parseInt(this.#dragOverItem.getAttribute("data-sortable-index") || "0", 10);
      this.#dragOverItem.removeAttribute("data-drag-over");
    }

    if (oldIndex !== newIndex) {
      this.#reorderItems(oldIndex, newIndex);
      emit(this, "gl-sort", { 
        item: this.#draggedItem, 
        oldIndex, 
        newIndex 
      });
    }

    this.#draggedItem.removeAttribute("data-dragging");
    this.#draggedItem.style.cursor = "";
    this.#draggedItem = undefined;
    this.#dragOverItem = undefined;

    emit(this, "gl-sort-end");
  }

  #reorderItems(oldIndex: number, newIndex: number) {
    const items = Array.from(this.children);
    const item = items[oldIndex];
    const targetItem = items[newIndex];
    
    if (!item || !targetItem) return;
    
    if (oldIndex < newIndex) {
      targetItem.after(item);
    } else {
      targetItem.before(item);
    }
    
    this.#updateItems();
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }
}
