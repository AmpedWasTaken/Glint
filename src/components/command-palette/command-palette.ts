import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: var(--gl-z-modal, 50);
      pointer-events: none;
    }
    :host([open]) {
      pointer-events: auto;
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity var(--gl-dur-2) var(--gl-ease-out);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    :host([open]) .backdrop {
      opacity: 1;
    }
    .palette {
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translateX(-50%) scale(0.95);
      width: 90%;
      max-width: 640px;
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius-lg);
      box-shadow: var(--gl-shadow-xl);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--gl-dur-1) var(--gl-ease-out), transform var(--gl-dur-1) var(--gl-ease-out);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    :host([open]) .palette {
      opacity: 1;
      transform: translateX(-50%) scale(1);
      pointer-events: auto;
    }
    .input-wrapper {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
      padding: var(--gl-space-4);
      border-bottom: 1px solid var(--gl-border);
    }
    .search-icon {
      width: 20px;
      height: 20px;
      color: var(--gl-muted);
      flex-shrink: 0;
    }
    .input {
      all: unset;
      flex: 1;
      font-size: var(--gl-text-md);
      color: var(--gl-fg);
    }
    .input::placeholder {
      color: var(--gl-muted);
    }
    .shortcut {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .shortcut-key {
      padding: 2px 6px;
      background: var(--gl-hover);
      border: 1px solid var(--gl-border);
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
      color: var(--gl-muted);
    }
    .results {
      flex: 1;
      overflow-y: auto;
      padding: var(--gl-space-2);
      max-height: 400px;
    }
    .group {
      margin-bottom: var(--gl-space-4);
    }
    .group-label {
      padding: var(--gl-space-2) var(--gl-space-3);
      font-size: var(--gl-text-xs);
      font-weight: 600;
      color: var(--gl-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .item {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
      padding: var(--gl-space-3);
      border-radius: var(--gl-radius-sm);
      cursor: pointer;
      transition: background var(--gl-dur-1) var(--gl-ease);
    }
    .item:hover,
    .item[data-selected] {
      background: var(--gl-hover);
    }
    .item-icon {
      width: 20px;
      height: 20px;
      color: var(--gl-muted);
      flex-shrink: 0;
    }
    .item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .item-title {
      font-size: var(--gl-text-sm);
      color: var(--gl-fg);
      font-weight: 500;
    }
    .item-description {
      font-size: var(--gl-text-xs);
      color: var(--gl-muted);
    }
    .item-shortcut {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .empty {
      padding: var(--gl-space-8);
      text-align: center;
      color: var(--gl-muted);
      font-size: var(--gl-text-sm);
    }
    :host([motion="snappy"]) .palette {
      transition: opacity var(--gl-dur-1) var(--gl-ease-spring), transform var(--gl-dur-1) var(--gl-ease-spring);
    }
    @media (prefers-reduced-motion: reduce) {
      .palette,
      .backdrop {
        transition: none;
      }
    }
  </style>
  <div class="backdrop" part="backdrop"></div>
  <div class="palette" part="palette" role="dialog" aria-modal="true">
    <div class="input-wrapper" part="input-wrapper">
      <svg class="search-icon" part="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input class="input" part="input" type="text" placeholder="Type a command or search..." autocomplete="off" />
      <div class="shortcut" part="shortcut">
        <kbd class="shortcut-key">⌘</kbd>
        <kbd class="shortcut-key">K</kbd>
      </div>
    </div>
    <div class="results" part="results">
      <slot name="results"></slot>
    </div>
  </div>
`;

export class GlCommandPalette extends HTMLElement {
  static tagName = "gl-command-palette";
  static get observedAttributes() {
    return ["open", "motion"];
  }

  #palette!: HTMLElement;
  #input!: HTMLInputElement;
  #backdrop!: HTMLElement;
  #selectedIndex = 0;
  #items: GlCommandItem[] = [];

  get open() {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    if (v) {
      this.setAttribute("open", "");
      requestAnimationFrame(() => {
        this.#input.focus();
        this.#updateResults();
      });
    } else {
      this.removeAttribute("open");
    }
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#palette = this.shadowRoot!.querySelector(".palette") as HTMLElement;
    this.#input = this.shadowRoot!.querySelector(".input") as HTMLInputElement;
    this.#backdrop = this.shadowRoot!.querySelector(".backdrop") as HTMLElement;

    this.#input.addEventListener("input", () => {
      this.#updateResults();
    });

    this.#backdrop.addEventListener("click", () => {
      this.open = false;
    });

    this.addEventListener("keydown", (e) => {
      if (!this.open) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          this.open = false;
          break;
        case "ArrowDown":
          e.preventDefault();
          this.#selectedIndex = Math.min(this.#selectedIndex + 1, this.#items.length - 1);
          this.#updateSelection();
          break;
        case "ArrowUp":
          e.preventDefault();
          this.#selectedIndex = Math.max(this.#selectedIndex - 1, 0);
          this.#updateSelection();
          break;
        case "Enter":
          e.preventDefault();
          const selectedItem = this.#items[this.#selectedIndex];
          if (selectedItem) {
            selectedItem.select();
          }
          break;
      }
    });

    // Global keyboard shortcut (Cmd/Ctrl + K)
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !this.open) {
        e.preventDefault();
        this.open = true;
      }
    });
  }

  attributeChangedCallback(name: string) {
    if (name === "open" && this.open) {
      this.#updateResults();
    }
  }

  #updateResults() {
    const query = this.#input.value.toLowerCase();
    const resultsSlot = this.shadowRoot!.querySelector('slot[name="results"]') as HTMLSlotElement;
    if (!resultsSlot) return;

    const assignedNodes = resultsSlot.assignedNodes();
    this.#items = assignedNodes.filter(
      (node) => node instanceof GlCommandItem
    ) as GlCommandItem[];

    this.#items.forEach((item) => {
      const matchesQuery = item.matchesQuery(query);
      item.style.display = matchesQuery ? "block" : "none";
    });

    this.#selectedIndex = 0;
    this.#updateSelection();
  }

  #updateSelection() {
    this.#items.forEach((item, index) => {
      if (index === this.#selectedIndex && item.style.display !== "none") {
        item.setAttribute("data-selected", "");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.removeAttribute("data-selected");
      }
    });
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
      gap: var(--gl-space-3);
      padding: var(--gl-space-3);
      border-radius: var(--gl-radius-sm);
      cursor: pointer;
      transition: background var(--gl-dur-1) var(--gl-ease);
    }
    .item:hover,
    :host([data-selected]) .item {
      background: var(--gl-hover);
    }
    .item-icon {
      width: 20px;
      height: 20px;
      color: var(--gl-muted);
      flex-shrink: 0;
    }
    .item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .item-title {
      font-size: var(--gl-text-sm);
      color: var(--gl-fg);
      font-weight: 500;
    }
    .item-description {
      font-size: var(--gl-text-xs);
      color: var(--gl-muted);
    }
    .item-shortcut {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .shortcut-key {
      padding: 2px 6px;
      background: var(--gl-hover);
      border: 1px solid var(--gl-border);
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
      color: var(--gl-muted);
    }
  </style>
  <div class="item" part="item">
    <span class="item-icon" part="icon"><slot name="icon"></slot></span>
    <div class="item-content" part="content">
      <span class="item-title" part="title"><slot name="title"></slot></span>
      <span class="item-description" part="description"><slot name="description"></slot></span>
    </div>
    <div class="item-shortcut" part="shortcut"><slot name="shortcut"></slot></div>
  </div>
`;

export class GlCommandItem extends HTMLElement {
  static tagName = "gl-command-item";
  static get observedAttributes() {
    return ["keywords"];
  }

  #item!: HTMLElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(itemTemplate.content.cloneNode(true));
    this.#item = this.shadowRoot!.querySelector(".item") as HTMLElement;

    this.#item.addEventListener("click", () => {
      this.select();
    });
  }

  matchesQuery(query: string): boolean {
    if (!query) return true;
    const title = this.getAttribute("title") || "";
    const keywords = this.getAttribute("keywords") || "";
    const searchText = `${title} ${keywords}`.toLowerCase();
    return searchText.includes(query);
  }

  select() {
    emit(this, "gl-select", {
      title: this.getAttribute("title"),
      value: this.getAttribute("value"),
    });
    const palette = this.closest("gl-command-palette") as GlCommandPalette;
    if (palette) palette.open = false;
  }
}

export class GlCommandGroup extends HTMLElement {
  static tagName = "gl-command-group";

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        margin-bottom: var(--gl-space-4);
      }
      .group-label {
        padding: var(--gl-space-2) var(--gl-space-3);
        font-size: var(--gl-text-xs);
        font-weight: 600;
        color: var(--gl-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    `;
    const label = document.createElement("div");
    label.className = "group-label";
    const slot = document.createElement("slot");
    label.appendChild(slot);
    this.shadowRoot!.appendChild(style);
    this.shadowRoot!.appendChild(label);
  }
}

