import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
    }
    .menu {
      position: fixed;
      z-index: var(--gl-z-popover, 45);
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      box-shadow: var(--gl-shadow-lg);
      padding: 4px;
      min-width: 200px;
      max-width: 320px;
      max-height: 400px;
      overflow-y: auto;
      opacity: 0;
      transform: scale(0.95) translateY(-8px);
      pointer-events: none;
      transition: opacity var(--gl-dur-1) var(--gl-ease-out), transform var(--gl-dur-1) var(--gl-ease-out);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    :host([open]) .menu {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: auto;
    }
    .item {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
      padding: 8px 12px;
      border-radius: var(--gl-radius-sm);
      font-size: var(--gl-text-sm);
      color: var(--gl-fg);
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      transition: background var(--gl-dur-1) var(--gl-ease), color var(--gl-dur-1) var(--gl-ease);
    }
    .item:hover,
    .item:focus {
      background: var(--gl-hover);
      outline: none;
    }
    .item[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
    .item[data-variant="destructive"] {
      color: var(--gl-danger);
    }
    .item[data-variant="destructive"]:hover {
      background: color-mix(in srgb, var(--gl-danger) 10%, transparent);
    }
    .separator {
      height: 1px;
      background: var(--gl-border);
      margin: 4px 0;
    }
    .label {
      padding: 8px 12px;
      font-size: var(--gl-text-xs);
      font-weight: 600;
      color: var(--gl-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .icon {
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .shortcut {
      margin-left: auto;
      font-size: var(--gl-text-xs);
      color: var(--gl-muted);
    }
    :host([motion="snappy"]) .menu {
      transition: opacity var(--gl-dur-1) var(--gl-ease-spring), transform var(--gl-dur-1) var(--gl-ease-spring);
    }
    @media (prefers-reduced-motion: reduce) {
      .menu {
        transition: none;
      }
    }
  </style>
  <div class="menu" part="menu" role="menu">
    <slot></slot>
  </div>
`;

export class GlMenu extends HTMLElement {
  static tagName = "gl-menu";
  static get observedAttributes() {
    return ["open", "motion"];
  }

  #menu!: HTMLElement;
  #clickOutsideHandler?: (e: MouseEvent) => void;

  get open() {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    if (v) {
      this.setAttribute("open", "");
      this.#position();
      this.#setupClickOutside();
    } else {
      this.removeAttribute("open");
      this.#removeClickOutside();
    }
  }

  #keydownHandler?: (e: KeyboardEvent) => void;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#menu = this.shadowRoot!.querySelector(".menu") as HTMLElement;

    // Setup keyboard navigation on document level to prevent scrolling
    this.#keydownHandler = (e: KeyboardEvent) => {
      if (!this.open) return;
      const items = Array.from(this.querySelectorAll("gl-menu-item:not([disabled])")) as GlMenuItem[];
      if (items.length === 0) return;
      
      // Find currently focused item
      let currentIndex = -1;
      for (let i = 0; i < items.length; i++) {
        const shadowRoot = items[i]?.shadowRoot;
        if (shadowRoot && shadowRoot.activeElement === shadowRoot.querySelector(".item")) {
          currentIndex = i;
          break;
        }
      }
      // If no item is focused, focus first one
      if (currentIndex === -1) {
        currentIndex = 0;
        items[0]?.focus();
      }

      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
          e.preventDefault();
          e.stopImmediatePropagation();
          if (e.key === "ArrowDown") {
            const nextIndex = (currentIndex + 1) % items.length;
            const nextItem = items[nextIndex];
            if (nextItem) nextItem.focus();
          } else {
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            const prevItem = items[prevIndex];
            if (prevItem) prevItem.focus();
          }
          break;
        case "Escape":
          e.preventDefault();
          e.stopImmediatePropagation();
          this.open = false;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          e.stopImmediatePropagation();
          const currentItem = items[currentIndex];
          if (currentItem) {
            const button = currentItem.shadowRoot?.querySelector(".item") as HTMLButtonElement;
            if (button) button.click();
          }
          break;
      }
    };
    
    document.addEventListener("keydown", this.#keydownHandler, true);
  }

  attributeChangedCallback(name: string) {
    if (name === "open" && this.open) {
      this.#position();
      // Focus first item when menu opens
      requestAnimationFrame(() => {
        const items = Array.from(this.querySelectorAll("gl-menu-item:not([disabled])")) as GlMenuItem[];
        const firstItem = items[0];
        if (firstItem) {
          firstItem.focus();
        }
      });
    }
  }

  #position() {
    requestAnimationFrame(() => {
      const trigger = this.getAttribute("trigger-id");
      if (trigger) {
        const triggerEl = document.getElementById(trigger);
        if (triggerEl) {
          const rect = triggerEl.getBoundingClientRect();
          const menuRect = this.#menu.getBoundingClientRect();
          const position = this.getAttribute("position") || "bottom-start";

          let top = 0;
          let left = 0;

          if (position.includes("bottom")) {
            top = rect.bottom + 8;
          } else if (position.includes("top")) {
            top = rect.top - menuRect.height - 8;
          } else {
            top = rect.top;
          }

          if (position.includes("start")) {
            left = rect.left;
          } else if (position.includes("end")) {
            left = rect.right - menuRect.width;
          } else {
            left = rect.left + (rect.width - menuRect.width) / 2;
          }

          // Keep within viewport
          top = Math.max(8, Math.min(top, window.innerHeight - menuRect.height - 8));
          left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));

          this.#menu.style.top = `${top}px`;
          this.#menu.style.left = `${left}px`;
        }
      }
    });
  }

  #setupClickOutside() {
    this.#clickOutsideHandler = (e: MouseEvent) => {
      const path = e.composedPath();
      if (!path.includes(this) && !path.includes(this.#menu)) {
        this.open = false;
      }
    };
    setTimeout(() => document.addEventListener("click", this.#clickOutsideHandler!), 0);
  }

  #removeClickOutside() {
    if (this.#clickOutsideHandler) {
      document.removeEventListener("click", this.#clickOutsideHandler);
      this.#clickOutsideHandler = undefined;
    }
  }

  disconnectedCallback() {
    if (this.#keydownHandler) {
      document.removeEventListener("keydown", this.#keydownHandler, true);
      this.#keydownHandler = undefined;
    }
    this.#removeClickOutside();
  }
}

const itemTemplate = document.createElement("template");
itemTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .item {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
      padding: 8px 12px;
      border-radius: var(--gl-radius-sm);
      font-size: var(--gl-text-sm);
      color: var(--gl-fg);
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      transition: background var(--gl-dur-1) var(--gl-ease), color var(--gl-dur-1) var(--gl-ease);
    }
    .item:hover,
    .item:focus {
      background: var(--gl-hover);
      outline: none;
    }
    :host([disabled]) .item {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
    :host([variant="destructive"]) .item {
      color: var(--gl-danger);
    }
    :host([variant="destructive"]) .item:hover {
      background: color-mix(in srgb, var(--gl-danger) 10%, transparent);
    }
    .icon {
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .shortcut {
      margin-left: auto;
      font-size: var(--gl-text-xs);
      color: var(--gl-muted);
    }
  </style>
  <button class="item" part="item" role="menuitem" tabindex="-1">
    <span class="icon" part="icon"><slot name="icon"></slot></span>
    <span part="label"><slot></slot></span>
    <span class="shortcut" part="shortcut"><slot name="shortcut"></slot></span>
  </button>
`;

export class GlMenuItem extends HTMLElement {
  static tagName = "gl-menu-item";
  static get observedAttributes() {
    return ["disabled", "variant"];
  }

  #item!: HTMLButtonElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(itemTemplate.content.cloneNode(true));
    this.#item = this.shadowRoot!.querySelector(".item") as HTMLButtonElement;

    this.#item.addEventListener("click", () => {
      if (!this.hasAttribute("disabled")) {
        emit(this, "gl-select", { value: this.getAttribute("value") || this.textContent });
        const menu = this.closest("gl-menu") as GlMenu;
        if (menu) menu.open = false;
      }
    });
  }

  attributeChangedCallback(name: string) {
    if (name === "disabled") {
      this.#item.disabled = this.hasAttribute("disabled");
    }
  }
}

export class GlMenuSeparator extends HTMLElement {
  static tagName = "gl-menu-separator";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        height: 1px;
        background: var(--gl-border);
        margin: 4px 0;
      }
    `;
    this.shadowRoot!.appendChild(style);
  }
}

export class GlMenuLabel extends HTMLElement {
  static tagName = "gl-menu-label";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        padding: 8px 12px;
        font-size: var(--gl-text-xs);
        font-weight: 600;
        color: var(--gl-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    `;
    const slot = document.createElement("slot");
    this.shadowRoot!.appendChild(style);
    this.shadowRoot!.appendChild(slot);
  }
}

