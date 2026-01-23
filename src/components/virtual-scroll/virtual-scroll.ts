const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .virtual-scroll-container {
      position: relative;
      width: 100%;
    }
    .virtual-scroll-spacer-top {
      width: 100%;
    }
    .virtual-scroll-spacer-bottom {
      width: 100%;
    }
    .virtual-scroll-content {
      position: relative;
    }
  </style>
  <div class="virtual-scroll-container" part="container">
    <div class="virtual-scroll-spacer-top" part="spacer-top"></div>
    <div class="virtual-scroll-content" part="content">
      <slot></slot>
    </div>
    <div class="virtual-scroll-spacer-bottom" part="spacer-bottom"></div>
  </div>
`;

export class GlVirtualScroll extends HTMLElement {
  static tagName = "gl-virtual-scroll";
  static get observedAttributes() {
    return ["item-height", "overscan"];
  }

  #container!: HTMLElement;
  #spacerTop!: HTMLElement;
  #spacerBottom!: HTMLElement;
  #content!: HTMLElement;
  #items: HTMLElement[] = [];
  #itemHeight = 50;
  #overscan = 5;
  #visibleStart = 0;
  #visibleEnd = 0;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#container = this.shadowRoot!.querySelector(".virtual-scroll-container") as HTMLElement;
    this.#spacerTop = this.shadowRoot!.querySelector(".virtual-scroll-spacer-top") as HTMLElement;
    this.#spacerBottom = this.shadowRoot!.querySelector(".virtual-scroll-spacer-bottom") as HTMLElement;
    this.#content = this.shadowRoot!.querySelector(".virtual-scroll-content") as HTMLElement;

    this.addEventListener("scroll", () => this.#updateVisibleItems());
    
    const observer = new MutationObserver(() => {
      this.#updateItems();
      this.#updateVisibleItems();
    });
    observer.observe(this, { childList: true, subtree: true });

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const itemHeight = this.getAttribute("item-height");
    if (itemHeight) {
      this.#itemHeight = parseInt(itemHeight, 10);
    }

    const overscan = this.getAttribute("overscan");
    if (overscan) {
      this.#overscan = parseInt(overscan, 10);
    }

    this.#updateItems();
    this.#updateVisibleItems();
  }

  #updateItems() {
    this.#items = Array.from(this.children) as HTMLElement[];
    this.#items.forEach((item, index) => {
      item.style.position = "absolute";
      item.style.top = `${index * this.#itemHeight}px`;
      item.style.width = "100%";
      item.style.height = `${this.#itemHeight}px`;
    });
  }

  #updateVisibleItems() {
    const scrollTop = this.scrollTop;
    const containerHeight = this.clientHeight;
    
    const start = Math.max(0, Math.floor(scrollTop / this.#itemHeight) - this.#overscan);
    const end = Math.min(
      this.#items.length,
      Math.ceil((scrollTop + containerHeight) / this.#itemHeight) + this.#overscan
    );

    this.#visibleStart = start;
    this.#visibleEnd = end;

    // Update spacers
    this.#spacerTop.style.height = `${start * this.#itemHeight}px`;
    this.#spacerBottom.style.height = `${(this.#items.length - end) * this.#itemHeight}px`;

    // Show/hide items
    this.#items.forEach((item, index) => {
      if (index >= start && index < end) {
        item.style.display = "";
        item.style.visibility = "visible";
      } else {
        item.style.display = "none";
        item.style.visibility = "hidden";
      }
    });

    // Update content height
    this.#content.style.height = `${this.#items.length * this.#itemHeight}px`;
  }

  get itemHeight() {
    return this.#itemHeight;
  }

  set itemHeight(v: number) {
    this.setAttribute("item-height", String(v));
  }

  get overscan() {
    return this.#overscan;
  }

  set overscan(v: number) {
    this.setAttribute("overscan", String(v));
  }
}
