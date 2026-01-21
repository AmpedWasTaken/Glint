const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    nav{display:block}
    ol{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
    a, span{
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      color:var(--gl-muted);
      text-decoration:none;
      white-space:nowrap;
      max-width:min(260px, 70vw);
      overflow:hidden;
      text-overflow:ellipsis;
    }
    a:hover{color:var(--gl-fg);text-decoration:underline}
    .current{color:var(--gl-fg);font-weight:600}
    .sep{color:color-mix(in srgb, var(--gl-muted) 70%, transparent);user-select:none}
  </style>
  <nav part="nav" aria-label="Breadcrumb">
    <ol part="list"></ol>
  </nav>
`;

export class GlBreadcrumb extends HTMLElement {
  static tagName = "gl-breadcrumb";
  static get observedAttributes() {
    return ["separator", "label"];
  }

  #list!: HTMLOListElement;
  #mo?: MutationObserver;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) root.appendChild(template.content.cloneNode(true));
    this.#list = root.querySelector("ol") as HTMLOListElement;
    this.#sync();

    this.#mo = new MutationObserver(() => this.#render());
    this.#mo.observe(this, { childList: true, subtree: true, attributes: true, characterData: true });
    this.#render();
  }

  disconnectedCallback() {
    this.#mo?.disconnect();
    this.#mo = undefined;
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
    else nav.setAttribute("aria-label", "Breadcrumb");
  }

  #render() {
    if (!this.#list) return;
    const sep = this.getAttribute("separator") ?? "/";
    const items = Array.from(this.querySelectorAll<HTMLElement>("gl-breadcrumb-item"));
    this.#list.textContent = "";

    items.forEach((item, idx) => {
      if (idx > 0) {
        const liSep = document.createElement("li");
        liSep.className = "sep";
        liSep.setAttribute("aria-hidden", "true");
        liSep.textContent = sep;
        this.#list.appendChild(liSep);
      }

      const li = document.createElement("li");
      const href = item.getAttribute("href");
      const current = item.hasAttribute("current") || idx === items.length - 1;

      if (href && !current) {
        const a = document.createElement("a");
        a.href = href;
        a.part = "link";
        a.append(...this.#cloneChildren(item));
        li.appendChild(a);
      } else {
        const span = document.createElement("span");
        span.part = "current";
        span.className = current ? "current" : "";
        if (current) span.setAttribute("aria-current", "page");
        span.append(...this.#cloneChildren(item));
        li.appendChild(span);
      }

      this.#list.appendChild(li);
    });
  }

  #cloneChildren(item: HTMLElement): Node[] {
    const nodes = Array.from(item.childNodes);
    if (nodes.length === 0) return [document.createTextNode(item.textContent?.trim() || "")];
    return nodes.map((n) => n.cloneNode(true));
  }
}


