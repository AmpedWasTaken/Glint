import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    .wrap{display:grid;gap:var(--gl-space-2);position:relative}
    .label{font-size:var(--gl-text-md);line-height:var(--gl-line-md);color:var(--gl-fg)}
    .desc{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm);color:var(--gl-muted)}
    .field{
      display:flex;
      align-items:center;
      gap:8px;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:6px;
      padding:8px 12px;
      transition:border-color 0.2s ease, box-shadow 0.2s ease;
      position:relative;
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
    input{
      all:unset;
      flex:1;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      min-width:0;
    }
    input::-webkit-search-cancel-button{display:none}
    input::-webkit-search-decoration{display:none}
    input[type="search"]::-ms-clear{display:none}
    input[type="search"]::-ms-reveal{display:none}
    input::placeholder{color:color-mix(in srgb, var(--gl-muted) 80%, transparent)}
    .suggestions{
      position:absolute;
      top:100%;
      left:0;
      right:0;
      margin-top:8px;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:8px;
      box-shadow:0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      max-height:280px;
      overflow-y:auto;
      z-index:1000;
      display:none;
      padding:4px;
      backdrop-filter:blur(12px);
      -webkit-backdrop-filter:blur(12px);
    }
    .suggestions.open{
      display:block;
      animation:slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideDown{
      from{
        opacity:0;
        transform:translateY(-8px) scale(0.96);
      }
      to{
        opacity:1;
        transform:translateY(0) scale(1);
      }
    }
    .suggestion{
      padding:10px 12px;
      cursor:pointer;
      transition:background 0.15s ease, color 0.15s ease;
      font-size:14px;
      line-height:20px;
      border-radius:6px;
      margin:2px 0;
      color:var(--gl-fg);
    }
    .suggestion:hover,.suggestion[aria-selected="true"]{
      background:var(--gl-hover);
      color:var(--gl-fg);
    }
    .suggestion:focus-visible{
      outline:2px solid var(--gl-ring);
      outline-offset:2px;
      background:var(--gl-hover);
    }
    :host([disabled]){opacity:0.65}
    :host([disabled]) .field{cursor:not-allowed}
    :host([disabled]) input{pointer-events:none}
    .icon{
      display:inline-flex;
      align-items:center;
      color:var(--gl-muted);
      font-size:16px;
    }
    .clear{
      display:none;
      cursor:pointer;
      color:var(--gl-muted);
      transition:color 0.15s ease, background 0.15s ease;
      width:18px;
      height:18px;
      border-radius:4px;
      align-items:center;
      justify-content:center;
      font-size:14px;
      line-height:1;
    }
    .clear:hover{
      color:var(--gl-fg);
      background:var(--gl-hover);
    }
    .clear.visible{display:inline-flex}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <span class="icon" part="icon"><slot name="icon">🔍</slot></span>
      <input part="input" type="search" autocomplete="off" />
      <span class="clear" part="clear" role="button" tabindex="0" aria-label="Clear search">✕</span>
    </span>
    <div class="suggestions" part="suggestions" role="listbox"></div>
  </label>
`;

export class GlSearchInput extends HTMLElement {
  static tagName = "gl-search-input";
  static get observedAttributes() {
    return [
      "value",
      "placeholder",
      "disabled",
      "name",
      "minlength",
      "maxlength",
      "debounce"
    ];
  }

  #input!: HTMLInputElement;
  #suggestions!: HTMLDivElement;
  #clear!: HTMLSpanElement;
  #suggestionItems: HTMLDivElement[] = [];
  #selectedIndex = -1;
  #debounceTimer?: number;
  #suggestionsData: string[] = [];

  get value() {
    return this.#input?.value ?? this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  override focus(options?: FocusOptions) {
    this.#input?.focus(options);
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#input = this.shadowRoot!.querySelector("input")!;
    this.#suggestions = this.shadowRoot!.querySelector(".suggestions") as HTMLDivElement;
    this.#clear = this.shadowRoot!.querySelector(".clear") as HTMLSpanElement;
    this.#sync();

    this.#input.addEventListener("input", () => {
      this.setAttribute("value", this.#input.value);
      this.#updateClear();
      this.#handleInput();
    });

    this.#input.addEventListener("focus", () => {
      if (this.#input.value && this.#suggestionsData.length > 0) {
        this.#showSuggestions();
      }
    });

    this.#input.addEventListener("blur", () => {
      setTimeout(() => {
        if (!this.#suggestions.matches(":hover") && !this.#suggestions.querySelector("[aria-selected='true']:hover")) {
          this.#hideSuggestions();
        }
      }, 200);
    });

    this.#input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.#navigateSuggestions(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.#navigateSuggestions(-1);
      } else if (e.key === "Enter") {
        if (this.#selectedIndex >= 0 && this.#suggestionItems[this.#selectedIndex]) {
          e.preventDefault();
          this.#selectSuggestion(this.#selectedIndex);
        } else {
          emit(this, "gl-search", { value: this.#input.value });
        }
      } else if (e.key === "Escape") {
        this.#hideSuggestions();
        this.#input.blur();
      }
    });

    this.#clear.addEventListener("click", () => {
      this.value = "";
      this.#input.focus();
      emit(this, "gl-change", { value: "" });
      emit(this, "gl-search", { value: "" });
    });

    this.#clear.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.#clear.click();
      }
    });

    document.addEventListener("click", (e) => {
      if (!this.contains(e.target as Node)) {
        this.#hideSuggestions();
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #handleInput() {
    const debounce = Number(this.getAttribute("debounce")) || 300;
    if (this.#debounceTimer) clearTimeout(this.#debounceTimer);
    
    this.#debounceTimer = window.setTimeout(() => {
      const value = this.#input.value;
      emit(this, "gl-change", { value });
      emit(this, "gl-search", { value });
      this.#updateSuggestions(value);
    }, debounce);
  }

  #updateSuggestions(query: string) {
    const suggestionsAttr = this.getAttribute("suggestions");
    if (!suggestionsAttr) return;

    try {
      const allSuggestions = JSON.parse(suggestionsAttr) as string[];
      const filtered = query
        ? allSuggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
        : allSuggestions.slice(0, 5);
      
      this.#suggestionsData = filtered;
      this.#renderSuggestions();
      if (filtered.length > 0 && query) {
        this.#showSuggestions();
      } else {
        this.#hideSuggestions();
      }
    } catch {
      // ignore
    }
  }

  #renderSuggestions() {
    this.#suggestions.innerHTML = "";
    this.#suggestionItems = [];
    this.#selectedIndex = -1;

    this.#suggestionsData.forEach((suggestion, index) => {
      const item = document.createElement("div");
      item.className = "suggestion";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");
      item.setAttribute("tabindex", "-1");
      item.textContent = suggestion;
      
      item.addEventListener("click", () => {
        this.#selectSuggestion(index);
      });

      item.addEventListener("mouseenter", () => {
        this.#selectedIndex = index;
        this.#updateSelection();
      });

      this.#suggestions.appendChild(item);
      this.#suggestionItems.push(item);
    });
  }

  #navigateSuggestions(direction: number) {
    if (this.#suggestionItems.length === 0) return;
    
    this.#selectedIndex += direction;
    if (this.#selectedIndex < 0) this.#selectedIndex = this.#suggestionItems.length - 1;
    if (this.#selectedIndex >= this.#suggestionItems.length) this.#selectedIndex = 0;
    
    this.#updateSelection();
    const item = this.#suggestionItems[this.#selectedIndex];
    if (item) item.scrollIntoView({ block: "nearest" });
  }

  #updateSelection() {
    this.#suggestionItems.forEach((item, index) => {
      item.setAttribute("aria-selected", String(index === this.#selectedIndex));
      item.setAttribute("tabindex", index === this.#selectedIndex ? "0" : "-1");
    });
  }

  #selectSuggestion(index: number) {
    if (index >= 0 && index < this.#suggestionItems.length) {
      const item = this.#suggestionItems[index];
      if (item) {
        const value = item.textContent || "";
        this.value = value;
        this.#input.value = value;
        this.#updateClear();
        this.#hideSuggestions();
        emit(this, "gl-change", { value });
        emit(this, "gl-select", { value, index });
      }
    }
  }

  #showSuggestions() {
    this.#suggestions.classList.add("open");
  }

  #hideSuggestions() {
    this.#suggestions.classList.remove("open");
    this.#selectedIndex = -1;
  }

  #updateClear() {
    const hasValue = this.#input.value.length > 0;
    this.#clear.classList.toggle("visible", hasValue);
  }

  #sync() {
    if (!this.#input) return;
    const value = this.getAttribute("value");
    if (value !== null && this.#input.value !== value) {
      this.#input.value = value;
      this.#updateClear();
    }
    this.#input.placeholder = this.getAttribute("placeholder") ?? "Search...";
    this.#input.disabled = this.hasAttribute("disabled");
    this.#input.name = this.getAttribute("name") ?? "";
    const minLen = this.getAttribute("minlength");
    if (minLen !== null) this.#input.minLength = Number(minLen);
    const maxLen = this.getAttribute("maxlength");
    if (maxLen !== null) this.#input.maxLength = Number(maxLen);
  }
}

