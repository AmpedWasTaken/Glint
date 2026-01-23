import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .tree {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tree-item {
      display: flex;
      flex-direction: column;
    }
    .tree-node {
      display: flex;
      align-items: center;
      gap: var(--gl-space-1);
      padding: 2px 4px;
      border-radius: 3px;
      cursor: pointer;
      user-select: none;
      transition: background var(--gl-dur-1) var(--gl-ease);
      min-height: 22px;
      font-size: var(--gl-text-sm);
      color: var(--gl-fg);
    }
    .tree-node:hover:not([aria-disabled="true"]) {
      background: var(--gl-hover);
    }
    .tree-node[aria-selected="true"] {
      background: var(--gl-hover);
      font-weight: 500;
    }
    .tree-node[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .tree-node[aria-disabled="true"]:hover {
      background: transparent;
    }
    .tree-node:focus-visible {
      outline: 1px solid var(--gl-ring);
      outline-offset: -1px;
    }
    .tree-toggle {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity var(--gl-dur-1) var(--gl-ease), transform var(--gl-dur-2) var(--gl-ease-out);
    }
    .tree-toggle:hover {
      opacity: 1;
    }
    .tree-toggle svg {
      width: 10px;
      height: 10px;
      transition: transform var(--gl-dur-2) var(--gl-ease-out);
    }
    :host([expanded]) .tree-toggle svg {
      transform: rotate(90deg);
    }
    .tree-children {
      margin-left: 16px;
      display: none;
      flex-direction: column;
      gap: 0;
    }
    :host([expanded]) .tree-children {
      display: flex;
    }
    .tree-item[data-expanded="true"] .tree-children {
      display: flex;
    }
    .tree-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
    }
    .tree-icon {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tree-label {
      flex: 1;
      font-size: var(--gl-text-md);
    }
    :host([variant="compact"]) .tree-node {
      padding: var(--gl-space-1) var(--gl-space-2);
      min-height: 24px;
    }
    :host([variant="spacious"]) .tree-node {
      padding: var(--gl-space-3) var(--gl-space-4);
      min-height: 40px;
    }
  </style>
  <div class="tree" part="tree">
    <slot></slot>
  </div>
`;

const itemTemplate = document.createElement("template");
itemTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .tree-item {
      display: flex;
      flex-direction: column;
    }
    .tree-node {
      display: flex;
      align-items: center;
      gap: var(--gl-space-1);
      padding: 2px 4px;
      border-radius: 3px;
      cursor: pointer;
      user-select: none;
      transition: background var(--gl-dur-1) var(--gl-ease);
      min-height: 22px;
      font-size: var(--gl-text-sm);
      color: var(--gl-fg);
    }
    .tree-node:hover:not([aria-disabled="true"]) {
      background: var(--gl-hover);
    }
    .tree-node[aria-selected="true"] {
      background: var(--gl-hover);
      font-weight: 500;
    }
    .tree-node[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .tree-node[aria-disabled="true"]:hover {
      background: transparent;
    }
    .tree-node:focus-visible {
      outline: 1px solid var(--gl-ring);
      outline-offset: -1px;
    }
    .tree-toggle {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity var(--gl-dur-1) var(--gl-ease), transform var(--gl-dur-2) var(--gl-ease-out);
    }
    .tree-toggle:hover {
      opacity: 1;
    }
    .tree-toggle svg {
      width: 10px;
      height: 10px;
      transition: transform var(--gl-dur-2) var(--gl-ease-out);
    }
    :host([expanded]) .tree-toggle svg {
      transform: rotate(90deg);
    }
    .tree-children {
      margin-left: 16px;
      display: none;
      flex-direction: column;
      gap: 0;
    }
    :host([expanded]) .tree-children {
      display: flex;
    }
    .tree-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
    }
    .tree-icon {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tree-label {
      flex: 1;
      font-size: var(--gl-text-md);
    }
  </style>
  <div class="tree-item" part="item">
    <div class="tree-node" part="node" role="treeitem" tabindex="0">
      <div class="tree-toggle" part="toggle">
        <slot name="toggle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </slot>
      </div>
      <div class="tree-content" part="content">
        <div class="tree-icon" part="icon">
          <slot name="icon"></slot>
        </div>
        <div class="tree-label" part="label">
          <slot></slot>
        </div>
      </div>
    </div>
    <div class="tree-children" part="children" role="group">
      <slot name="children"></slot>
    </div>
  </div>
`;

export class GlTree extends HTMLElement {
  static tagName = "gl-tree";
  static get observedAttributes() {
    return ["variant"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }
}

export class GlTreeItem extends HTMLElement {
  static tagName = "gl-tree-item";
  static get observedAttributes() {
    return ["expanded", "selected", "selectable", "disabled"];
  }

  #node!: HTMLElement;
  #toggle!: HTMLElement;
  #children!: HTMLElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(itemTemplate.content.cloneNode(true));
    
    this.#node = this.shadowRoot!.querySelector(".tree-node") as HTMLElement;
    this.#toggle = this.shadowRoot!.querySelector(".tree-toggle") as HTMLElement;
    this.#children = this.shadowRoot!.querySelector(".tree-children") as HTMLElement;

    const hasChildren = this.querySelector("gl-tree-item") !== null;
    if (!hasChildren) {
      this.#toggle.style.display = "none";
    }

    this.#toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.#node.addEventListener("click", () => {
      if (this.disabled) return;
      
      // Check if selectable (default: files are selectable, folders are not)
      const isSelectable = this.selectable !== null 
        ? this.selectable 
        : !hasChildren; // Default: files are selectable, folders are not
      
      if (isSelectable) {
        this.select();
      }
    });

    this.#node.addEventListener("keydown", (e) => {
      if (this.disabled) return;
      
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // Check if selectable (default: files are selectable, folders are not)
        const isSelectable = this.selectable !== null 
          ? this.selectable 
          : !hasChildren; // Default: files are selectable, folders are not
        
        if (isSelectable) {
          this.select();
        }
      } else if (e.key === "ArrowRight" && hasChildren && !this.expanded) {
        e.preventDefault();
        this.expanded = true;
      } else if (e.key === "ArrowLeft" && hasChildren && this.expanded) {
        e.preventDefault();
        this.expanded = false;
      }
    });

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (this.#node) {
      this.#node.setAttribute("aria-selected", this.selected ? "true" : "false");
      this.#node.setAttribute("aria-expanded", this.expanded ? "true" : "false");
      this.#node.setAttribute("aria-disabled", this.disabled ? "true" : "false");
    }
  }

  get expanded() {
    return this.hasAttribute("expanded");
  }

  set expanded(v: boolean) {
    if (v) this.setAttribute("expanded", "");
    else this.removeAttribute("expanded");
  }

  get selected() {
    return this.hasAttribute("selected");
  }

  set selected(v: boolean) {
    if (v) this.setAttribute("selected", "");
    else this.removeAttribute("selected");
  }

  toggle() {
    this.expanded = !this.expanded;
    emit(this, "gl-tree-toggle", { expanded: this.expanded });
  }

  select() {
    if (this.disabled) return;
    
    // Check if selectable (default: files are selectable, folders are not)
    const hasChildren = this.querySelector("gl-tree-item") !== null;
    const isSelectable = this.selectable !== null 
      ? this.selectable 
      : !hasChildren; // Default: files are selectable, folders are not
    
    if (!isSelectable) {
      return;
    }

    // If already selected, toggle off
    if (this.selected) {
      this.selected = false;
      emit(this, "gl-tree-select", { selected: false });
      return;
    }

    // Deselect siblings
    const parent = this.parentElement;
    if (parent) {
      const siblings = parent.querySelectorAll("gl-tree-item");
      siblings.forEach((sibling) => {
        if (sibling !== this) {
          sibling.removeAttribute("selected");
        }
      });
    }
    this.selected = true;
    emit(this, "gl-tree-select", { selected: true });
  }

  get selectable() {
    const attr = this.getAttribute("selectable");
    if (attr === null) return null; // Not specified, use default behavior
    return attr !== "false"; // "true" or empty string means selectable
  }

  set selectable(v: boolean | null) {
    if (v === null) {
      this.removeAttribute("selectable");
    } else if (v) {
      this.setAttribute("selectable", "");
    } else {
      this.setAttribute("selectable", "false");
    }
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }
}

