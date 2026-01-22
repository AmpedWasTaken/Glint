import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    .wrap{display:grid;gap:var(--gl-space-2)}
    .label{font-size:var(--gl-text-md);line-height:var(--gl-line-md);color:var(--gl-fg)}
    .desc{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm);color:var(--gl-muted)}
    .field{
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      gap:6px;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:6px;
      padding:6px 10px;
      transition:border-color 0.2s ease, box-shadow 0.2s ease;
      min-height:40px;
    }
    .field:hover{border-color:color-mix(in srgb, var(--gl-border) 80%, var(--gl-fg))}
    .field:focus-within{
      border-color:var(--gl-ring);
      box-shadow:0 0 0 3px color-mix(in srgb, var(--gl-ring) 20%, transparent);
      outline:none;
    }
    :host([error]) .field{
      border-color:var(--gl-danger);
      box-shadow:0 0 0 3px color-mix(in srgb, var(--gl-danger) 20%, transparent);
    }
    .tags{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
    .tag{
      display:inline-flex;
      align-items:center;
      gap:6px;
      background:var(--gl-primary);
      color:var(--gl-primary-fg);
      padding:4px 10px;
      border-radius:4px;
      font-size:13px;
      line-height:18px;
      font-weight:500;
      box-shadow:0 1px 2px rgba(0,0,0,0.05);
    }
    :host([variant="secondary"]) .tag{
      background:var(--gl-panel);
      color:var(--gl-fg);
      border:1px solid var(--gl-border);
    }
    :host([variant="outline"]) .tag{
      background:transparent;
      color:var(--gl-primary);
      border:1px solid var(--gl-primary);
    }
    .tag-remove{
      cursor:pointer;
      transition:background 0.15s ease, color 0.15s ease;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:16px;
      height:16px;
      border-radius:3px;
      color:var(--gl-primary-fg);
      opacity:0.8;
      margin-left:-2px;
    }
    .tag-remove:hover{
      opacity:1;
      background:rgba(0,0,0,0.15);
    }
    input{
      all:unset;
      flex:1;
      min-width:120px;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
    }
    input::placeholder{color:color-mix(in srgb, var(--gl-muted) 80%, transparent)}
    :host([disabled]){opacity:0.65}
    :host([disabled]) .field{cursor:not-allowed}
    :host([disabled]) input{pointer-events:none}
    :host([disabled]) .tag-remove{pointer-events:none}
    .message{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm)}
    :host([error]) .message{color:var(--gl-danger)}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <div class="tags" part="tags"></div>
      <input part="input" type="text" />
    </span>
    <span part="message" class="message" aria-live="polite"></span>
  </label>
`;

export class GlTagInput extends HTMLElement {
  static tagName = "gl-tag-input";
  static get observedAttributes() {
    return [
      "value",
      "placeholder",
      "disabled",
      "name",
      "separator",
      "max",
      "error",
      "variant"
    ];
  }

  #input!: HTMLInputElement;
  #tagsContainer!: HTMLDivElement;
  #message!: HTMLSpanElement;
  #tags: string[] = [];
  #separator = ",";

  get value() {
    return JSON.stringify(this.#tags);
  }
  set value(v: string) {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) {
        this.#tags = parsed;
        this.#renderTags();
        this.setAttribute("value", v);
      }
    } catch {
      // ignore
    }
  }

  get tags() {
    return [...this.#tags];
  }

  override focus(options?: FocusOptions) {
    this.#input?.focus(options);
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#input = this.shadowRoot!.querySelector("input")!;
    this.#tagsContainer = this.shadowRoot!.querySelector(".tags") as HTMLDivElement;
    this.#message = this.shadowRoot!.querySelector(".message") as HTMLSpanElement;
    
    const valueAttr = this.getAttribute("value");
    if (valueAttr) {
      try {
        this.#tags = JSON.parse(valueAttr);
      } catch {
        this.#tags = [];
      }
    }
    
    this.#separator = this.getAttribute("separator") || ",";
    this.#sync();
    this.#renderTags();

    this.#input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || (e.key === this.#separator && this.#separator !== ",")) {
        e.preventDefault();
        this.#addTag(this.#input.value.trim());
      } else if (e.key === "Backspace" && this.#input.value === "" && this.#tags.length > 0) {
        e.preventDefault();
        this.#removeTag(this.#tags.length - 1);
      }
    });

    this.#input.addEventListener("blur", () => {
      const value = this.#input.value.trim();
      if (value) {
        this.#addTag(value);
      }
    });

    this.#input.addEventListener("paste", (e) => {
      const pasted = e.clipboardData?.getData("text") || "";
      if (pasted.includes(this.#separator)) {
        e.preventDefault();
        const tags = pasted.split(this.#separator).map(t => t.trim()).filter(t => t);
        tags.forEach(tag => this.#addTag(tag));
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #addTag(tag: string) {
    if (!tag) return;
    
    const max = this.getAttribute("max");
    if (max && this.#tags.length >= Number(max)) {
      this.setAttribute("error", `Maximum ${max} tags allowed`);
      return;
    }

    if (this.#tags.includes(tag)) {
      this.setAttribute("error", "Tag already exists");
      return;
    }

    this.#tags.push(tag);
    this.#input.value = "";
    this.#renderTags();
    this.setAttribute("value", JSON.stringify(this.#tags));
    this.removeAttribute("error");
    emit(this, "gl-change", { tags: [...this.#tags] });
    emit(this, "gl-tag-add", { tag, tags: [...this.#tags] });
  }

  #removeTag(index: number) {
    if (index < 0 || index >= this.#tags.length) return;
    const tag = this.#tags[index];
    this.#tags.splice(index, 1);
    this.#renderTags();
    this.setAttribute("value", JSON.stringify(this.#tags));
    emit(this, "gl-change", { tags: [...this.#tags] });
    emit(this, "gl-tag-remove", { tag, tags: [...this.#tags] });
  }

  #renderTags() {
    this.#tagsContainer.innerHTML = "";
    this.#tags.forEach((tag, index) => {
      const tagEl = document.createElement("span");
      tagEl.className = "tag";
      tagEl.setAttribute("part", "tag");
      tagEl.textContent = tag;
      
      if (!this.hasAttribute("disabled")) {
        const remove = document.createElement("span");
        remove.className = "tag-remove";
        remove.setAttribute("part", "tag-remove");
        remove.setAttribute("role", "button");
        remove.setAttribute("tabindex", "0");
        remove.setAttribute("aria-label", `Remove ${tag}`);
        remove.textContent = "×";
        
        remove.addEventListener("click", () => {
          this.#removeTag(index);
        });
        
        remove.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.#removeTag(index);
          }
        });
        
        tagEl.appendChild(remove);
      }
      
      this.#tagsContainer.appendChild(tagEl);
    });
  }

  #sync() {
    if (!this.#input) return;
    this.#input.placeholder = this.getAttribute("placeholder") ?? "Add tags...";
    this.#input.disabled = this.hasAttribute("disabled");
    this.#input.name = this.getAttribute("name") ?? "";
    this.#separator = this.getAttribute("separator") || ",";
    
    const error = this.getAttribute("error");
    if (error !== null && this.#message) {
      this.#message.textContent = error;
    } else if (this.#message) {
      this.#message.textContent = "";
    }
  }
}

