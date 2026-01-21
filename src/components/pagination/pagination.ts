import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    nav{display:flex;align-items:center;justify-content:flex-end}
    .wrap{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
    button{
      all:unset;
      cursor:pointer;
      user-select:none;
      height:36px;
      min-width:36px;
      padding:0 10px;
      border-radius:10px;
      border:1px solid var(--gl-border);
      background:var(--gl-panel);
      color:var(--gl-fg);
      box-shadow:var(--gl-shadow-sm);
      display:inline-flex;
      align-items:center;
      justify-content:center;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      transition:transform var(--gl-dur-1) var(--gl-ease), box-shadow var(--gl-dur-1) var(--gl-ease), background var(--gl-dur-1) var(--gl-ease), border-color var(--gl-dur-1) var(--gl-ease);
    }
    button:hover{background:var(--gl-hover);box-shadow:var(--gl-shadow-md);transform:translateY(-1px)}
    button:active{transform:translateY(0)}
    button:focus-visible{outline:2px solid var(--gl-ring);outline-offset:2px}
    button[disabled]{opacity:0.55;cursor:not-allowed;pointer-events:none}
    button[data-current="true"]{
      border-color:transparent;
      background:var(--gl-primary);
      color:var(--gl-primary-fg);
    }
    .dots{
      color:var(--gl-muted);
      padding:0 6px;
      height:36px;
      display:inline-flex;
      align-items:center;
      user-select:none;
    }
    :host([size="sm"]) button{height:32px;min-width:32px;border-radius:9px;font-size:12px}
    :host([size="lg"]) button{height:40px;min-width:40px;border-radius:12px;font-size:16px}
  </style>
  <nav part="nav" aria-label="Pagination">
    <div part="list" class="wrap"></div>
  </nav>
`;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export class GlPagination extends HTMLElement {
  static tagName = "gl-pagination";
  static get observedAttributes() {
    return ["page", "pages", "sibling", "boundary", "label"];
  }

  #wrap!: HTMLDivElement;

  get page() {
    return Number(this.getAttribute("page")) || 1;
  }
  set page(v: number) {
    this.setAttribute("page", String(v));
  }

  get pages() {
    return Number(this.getAttribute("pages")) || 1;
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) root.appendChild(template.content.cloneNode(true));
    this.#wrap = root.querySelector(".wrap") as HTMLDivElement;
    this.#sync();
    this.#render();

    this.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("button:not([disabled])"));
      const active = document.activeElement as HTMLElement | null;
      const idx = buttons.indexOf(active as HTMLButtonElement);
      if (idx === -1) return;
      e.preventDefault();
      const next = e.key === "ArrowRight" ? idx + 1 : idx - 1;
      buttons[clamp(next, 0, buttons.length - 1)]?.focus();
    });
  }

  attributeChangedCallback() {
    this.#sync();
    this.#render();
  }

  #sync() {
    const root = this.shadowRoot as ShadowRoot | null;
    const nav = root?.querySelector("nav");
    if (!nav) return;
    const label = this.getAttribute("label");
    if (label) nav.setAttribute("aria-label", label);
    else nav.setAttribute("aria-label", "Pagination");
  }

  #render() {
    if (!this.#wrap) return;
    const pages = Math.max(1, this.pages);
    const page = clamp(this.page, 1, pages);
    if (page !== this.page) this.page = page;

    const sibling = clamp(Number(this.getAttribute("sibling")) || 1, 0, 4);
    const boundary = clamp(Number(this.getAttribute("boundary")) || 1, 0, 3);

    const show = new Set<number>();
    for (let i = 1; i <= boundary; i++) show.add(i);
    for (let i = pages - boundary + 1; i <= pages; i++) show.add(i);
    for (let i = page - sibling; i <= page + sibling; i++) show.add(i);

    const ordered = Array.from(show).filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    const items: Array<number | "dots"> = [];
    let prev = 0;
    for (const n of ordered) {
      if (prev && n - prev > 1) items.push("dots");
      items.push(n);
      prev = n;
    }

    this.#wrap.textContent = "";

    this.#wrap.appendChild(this.#button("Prev", page - 1, page === 1, "prev"));
    for (const it of items) {
      if (it === "dots") {
        const s = document.createElement("span");
        s.className = "dots";
        s.part = "dots";
        s.textContent = "…";
        this.#wrap.appendChild(s);
        continue;
      }
      const b = this.#button(String(it), it, false, "page");
      if (it === page) b.dataset.current = "true";
      b.setAttribute("aria-current", it === page ? "page" : "false");
      this.#wrap.appendChild(b);
    }
    this.#wrap.appendChild(this.#button("Next", page + 1, page === pages, "next"));
  }

  #button(label: string, to: number, disabled: boolean, part: string) {
    const b = document.createElement("button");
    b.type = "button";
    b.part = part;
    b.textContent = label;
    if (disabled) b.disabled = true;
    b.addEventListener("click", () => {
      const pages = Math.max(1, this.pages);
      const next = clamp(to, 1, pages);
      if (next === this.page) return;
      this.page = next;
      emit(this, "gl-change", { page: next, pages });
    });
    return b;
  }
}


