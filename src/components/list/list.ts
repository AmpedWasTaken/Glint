import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      background: var(--gl-panel);
      overflow: hidden;
    }
    :host([variant="bordered"]) .list {
      border: 1px solid var(--gl-border);
    }
    :host([variant="none"]) .list {
      border: none;
      background: transparent;
    }
    :host([variant="card"]) .list {
      box-shadow: var(--gl-shadow-sm);
    }
  </style>
  <div class="list" part="list">
    <slot></slot>
  </div>
`;

const itemTemplate = document.createElement("template");
itemTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
      padding: var(--gl-space-3) var(--gl-space-4);
      cursor: pointer;
      user-select: none;
      transition: background var(--gl-dur-1) var(--gl-ease), color var(--gl-dur-1) var(--gl-ease);
      border-bottom: 1px solid var(--gl-border);
    }
    .list-item:last-child {
      border-bottom: none;
    }
    .list-item:hover {
      background: var(--gl-hover);
    }
    .list-item[aria-selected="true"] {
      background: var(--gl-hover);
      border-left: 3px solid var(--gl-primary);
      padding-left: calc(var(--gl-space-4) - 3px);
    }
    .list-item[aria-selected="true"] .list-title {
      font-weight: 600;
    }
    .list-item[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .list-item[disabled]:hover {
      background: transparent;
    }
    .list-checkbox {
      flex-shrink: 0;
    }
    .list-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
    }
    .list-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .list-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--gl-space-1);
    }
    .list-title {
      font-size: var(--gl-text-md);
      font-weight: 500;
      line-height: var(--gl-line-md);
    }
    .list-description {
      font-size: var(--gl-text-sm);
      color: var(--gl-muted);
      line-height: var(--gl-line-sm);
    }
    .list-actions {
      display: flex;
      gap: var(--gl-space-2);
      flex-shrink: 0;
    }
    :host([variant="compact"]) .list-item {
      padding: var(--gl-space-2) var(--gl-space-3);
    }
    :host([variant="spacious"]) .list-item {
      padding: var(--gl-space-4) var(--gl-space-5);
    }
  </style>
  <div class="list-item" part="item" role="listitem" tabindex="0">
    <div class="list-checkbox" part="checkbox">
      <slot name="checkbox"></slot>
    </div>
    <div class="list-content" part="content">
      <div class="list-icon" part="icon">
        <slot name="icon"></slot>
      </div>
      <div class="list-main" part="main">
        <div class="list-title" part="title">
          <slot name="title"></slot>
        </div>
        <div class="list-description" part="description">
          <slot name="description"></slot>
        </div>
      </div>
    </div>
    <div class="list-actions" part="actions">
      <slot name="actions"></slot>
    </div>
  </div>
`;

export class GlList extends HTMLElement {
  static tagName = "gl-list";
  static get observedAttributes() {
    return ["variant", "selectable"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }
}

export class GlListItem extends HTMLElement {
  static tagName = "gl-list-item";
  static get observedAttributes() {
    return ["selected", "disabled", "variant"];
  }

  #item!: HTMLElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(itemTemplate.content.cloneNode(true));
    
    this.#item = this.shadowRoot!.querySelector(".list-item") as HTMLElement;

    this.#item.addEventListener("click", () => {
      if (!this.disabled) {
        this.toggle();
      }
    });

    this.#item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!this.disabled) {
          this.toggle();
        }
      }
    });

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (this.#item) {
      this.#item.setAttribute("aria-selected", this.selected ? "true" : "false");
      if (this.disabled) {
        this.#item.setAttribute("disabled", "");
      } else {
        this.#item.removeAttribute("disabled");
      }
    }
  }

  get selected() {
    return this.hasAttribute("selected");
  }

  set selected(v: boolean) {
    if (v) this.setAttribute("selected", "");
    else this.removeAttribute("selected");
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  toggle() {
    this.selected = !this.selected;
    emit(this, "gl-list-select", { selected: this.selected });
  }
}

