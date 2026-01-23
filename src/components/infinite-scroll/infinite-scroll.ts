import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
      overflow-y: auto;
    }
    .infinite-scroll-loader {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--gl-space-4);
      color: var(--gl-muted);
      font-size: var(--gl-text-sm);
    }
    .infinite-scroll-loader[hidden] {
      display: none;
    }
    .infinite-scroll-end {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--gl-space-4);
      color: var(--gl-muted);
      font-size: var(--gl-text-sm);
    }
    .infinite-scroll-end[hidden] {
      display: none;
    }
  </style>
  <slot></slot>
  <div class="infinite-scroll-loader" part="loader" hidden>
    <slot name="loader">
      <gl-spinner size="sm"></gl-spinner>
      <span style="margin-left: var(--gl-space-2);">Loading more...</span>
    </slot>
  </div>
  <div class="infinite-scroll-end" part="end" hidden>
    <slot name="end">No more items</slot>
  </div>
`;

export class GlInfiniteScroll extends HTMLElement {
  static tagName = "gl-infinite-scroll";
  static get observedAttributes() {
    return ["disabled", "threshold", "has-more"];
  }

  #loader!: HTMLElement;
  #end!: HTMLElement;
  #isLoading = false;
  #hasMore = true;
  #threshold = 100;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#loader = this.shadowRoot!.querySelector(".infinite-scroll-loader") as HTMLElement;
    this.#end = this.shadowRoot!.querySelector(".infinite-scroll-end") as HTMLElement;

    this.addEventListener("scroll", () => this.#checkScroll());
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const threshold = this.getAttribute("threshold");
    if (threshold) {
      this.#threshold = parseInt(threshold, 10);
    }

    this.#hasMore = this.hasAttribute("has-more");
    this.#updateUI();
  }

  #checkScroll() {
    if (this.hasAttribute("disabled") || this.#isLoading || !this.#hasMore) return;

    const scrollTop = this.scrollTop;
    const scrollHeight = this.scrollHeight;
    const clientHeight = this.clientHeight;

    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    if (distanceFromBottom <= this.#threshold) {
      this.#loadMore();
    }
  }

  #loadMore() {
    if (this.#isLoading) return;

    this.#isLoading = true;
    this.#loader.hidden = false;
    this.#updateUI();

    emit(this, "gl-infinite-scroll-load");
  }

  #updateUI() {
    if (this.#hasMore) {
      this.#end.hidden = true;
      this.#loader.hidden = !this.#isLoading;
    } else {
      this.#loader.hidden = true;
      this.#end.hidden = false;
    }
  }

  complete() {
    this.#isLoading = false;
    this.#hasMore = false;
    this.removeAttribute("has-more");
    this.#updateUI();
    emit(this, "gl-infinite-scroll-complete");
  }

  reset() {
    this.#isLoading = false;
    this.#hasMore = true;
    this.setAttribute("has-more", "");
    this.#updateUI();
    emit(this, "gl-infinite-scroll-reset");
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  get threshold() {
    return this.#threshold;
  }

  set threshold(v: number) {
    this.setAttribute("threshold", String(v));
  }

  get hasMore() {
    return this.#hasMore;
  }

  set hasMore(v: boolean) {
    if (v) {
      this.setAttribute("has-more", "");
      this.#hasMore = true;
    } else {
      this.removeAttribute("has-more");
      this.#hasMore = false;
    }
    this.#updateUI();
  }
}
