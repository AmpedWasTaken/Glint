import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block;position:relative}
    .wrap{display:grid;gap:8px;position:relative}
    .label{font-size:14px;line-height:20px;font-weight:500;color:var(--gl-fg)}
    .desc{font-size:13px;line-height:18px;color:var(--gl-muted)}
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
      cursor:pointer;
    }
    .field:hover{border-color:color-mix(in srgb, var(--gl-border) 80%, var(--gl-fg))}
    .field:focus-within{
      border-color:var(--gl-ring);
      box-shadow:0 0 0 3px color-mix(in srgb, var(--gl-ring) 20%, transparent);
      outline:none;
    }
    .value{
      flex:1;
      min-width:0;
      font-size:14px;
      line-height:20px;
      color:var(--gl-fg);
      pointer-events:none;
    }
    .value.placeholder{
      color:var(--gl-muted);
    }
    .chev{
      width:18px;
      height:18px;
      color:var(--gl-muted);
      pointer-events:none;
      flex-shrink:0;
      transition:transform 0.2s ease, color 0.2s ease;
    }
    .field:hover .chev{color:var(--gl-fg)}
    :host([open]) .chev{
      transform:rotate(180deg);
      color:var(--gl-ring);
    }
    .dropdown{
      position:fixed;
      left:0;
      top:0;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:8px;
      box-shadow:0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      z-index:var(--gl-z-popover);
      display:none;
      max-height:280px;
      overflow-y:auto;
      padding:4px;
      backdrop-filter:blur(12px);
      -webkit-backdrop-filter:blur(12px);
      min-width:200px;
    }
    .dropdown.open{
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
    .option{
      padding:10px 12px;
      cursor:pointer;
      transition:background 0.15s ease, color 0.15s ease;
      font-size:14px;
      line-height:20px;
      border-radius:6px;
      margin:2px 0;
      color:var(--gl-fg);
    }
    .option:hover,.option[aria-selected="true"]{
      background:var(--gl-hover);
      color:var(--gl-fg);
    }
    .option:focus-visible{
      outline:2px solid var(--gl-ring);
      outline-offset:2px;
      background:var(--gl-hover);
    }
    .option[disabled]{
      opacity:0.5;
      cursor:not-allowed;
      pointer-events:none;
    }
    :host([disabled]){opacity:0.5;pointer-events:none}
    :host([disabled]) .field{cursor:not-allowed}
    select{position:absolute;opacity:0;pointer-events:none;width:0;height:0}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <span class="value" part="value"></span>
      <svg class="chev" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7 10l5 5 5-5z"></path>
      </svg>
      <select part="select"></select>
    </span>
    <div class="dropdown" part="dropdown" role="listbox"></div>
  </label>
`;

export class GlSelect extends HTMLElement {
  static tagName = "gl-select";
  static get observedAttributes() {
    return ["value", "disabled", "name", "open", "options"];
  }

  #select!: HTMLSelectElement;
  #field!: HTMLSpanElement;
  #valueDisplay!: HTMLSpanElement;
  #dropdown!: HTMLDivElement;
  #options: HTMLDivElement[] = [];
  #selectedIndex = -1;

  get value() {
    return this.#select?.value ?? this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  get open() {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    if (v) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#select = this.shadowRoot!.querySelector("select")!;
    this.#field = this.shadowRoot!.querySelector(".field") as HTMLSpanElement;
    this.#valueDisplay = this.shadowRoot!.querySelector(".value") as HTMLSpanElement;
    this.#dropdown = this.shadowRoot!.querySelector(".dropdown") as HTMLDivElement;

    this.#parseOptions();
    
    this.#field.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.hasAttribute("disabled")) {
        const wasOpen = this.open;
        this.open = !wasOpen;
        if (!wasOpen && this.open) {
          // Ensure dropdown is positioned and visible
          queueMicrotask(() => {
            this.#positionDropdown();
          });
        }
      }
    });

    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.open) {
        this.open = false;
      } else if (e.key === "Enter" || e.key === " ") {
        if (this.open && this.#selectedIndex >= 0) {
          e.preventDefault();
          const option = this.#options[this.#selectedIndex];
          if (option && !option.hasAttribute("disabled")) {
            const value = option.dataset.value || "";
            this.#selectOption(value);
          }
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!this.open) {
          this.open = true;
        } else {
          this.#navigateOptions(1);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.open) {
          this.#navigateOptions(-1);
        }
      }
    });

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (this.open) {
        const isInsideComponent = this.contains(target) || this.shadowRoot?.contains(target);
        const isInsideDropdown = this.#dropdown.contains(target);
        if (!isInsideComponent && !isInsideDropdown) {
          this.open = false;
        }
      }
    };
    const handleReposition = () => {
      if (this.open) {
        this.#positionDropdown();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    window.addEventListener("resize", handleReposition, { passive: true });
    window.addEventListener("scroll", handleReposition, { passive: true });

    this.#sync();
  }

  attributeChangedCallback(name: string) {
    if (name === "options" && this.shadowRoot) {
      this.#parseOptions();
    }
    this.#sync();
  }

  #sync() {
    if (!this.#select) return;
    this.#select.disabled = this.hasAttribute("disabled");
    this.#select.name = this.getAttribute("name") ?? "";
    const v = this.getAttribute("value");
    if (v !== null) {
      this.#select.value = v;
      this.#updateDisplay();
    }
    
    const isOpen = this.open;
    this.#dropdown.classList.toggle("open", isOpen);
    if (isOpen) {
      if (this.#options.length > 0) {
        const currentIndex = this.#options.findIndex(opt => opt.dataset.value === this.value);
        this.#selectedIndex = currentIndex >= 0 ? currentIndex : 0;
        this.#updateSelection();
      }
      queueMicrotask(() => {
        this.#positionDropdown();
      });
    } else {
      this.#dropdown.style.left = "";
      this.#dropdown.style.top = "";
      this.#dropdown.style.width = "";
    }
  }

  #positionDropdown() {
    if (!this.open || !this.#field || !this.#dropdown) return;
    
    // Force display to calculate size
    const wasVisible = this.#dropdown.classList.contains("open");
    if (!wasVisible) {
      this.#dropdown.style.display = "block";
      this.#dropdown.style.visibility = "hidden";
    }
    
    const field = this.#field.getBoundingClientRect();
    const dropdown = this.#dropdown.getBoundingClientRect();
    
    let left = field.left;
    let top = field.bottom + 8;
    
    const pad = 12;
    if (left + dropdown.width > window.innerWidth - pad) {
      left = window.innerWidth - dropdown.width - pad;
    }
    if (left < pad) left = pad;
    
    if (top + dropdown.height > window.innerHeight - pad) {
      top = field.top - dropdown.height - 8;
    }
    if (top < pad) top = pad;
    
    this.#dropdown.style.left = `${left}px`;
    this.#dropdown.style.top = `${top}px`;
    this.#dropdown.style.width = `${field.width}px`;
    
    if (!wasVisible) {
      this.#dropdown.style.visibility = "";
    }
  }

  #updateDisplay() {
    if (!this.#valueDisplay) return;
    const selectedOption = this.#select.options[this.#select.selectedIndex];
    if (selectedOption) {
      this.#valueDisplay.textContent = selectedOption.textContent;
      this.#valueDisplay.classList.remove("placeholder");
    } else {
      this.#valueDisplay.textContent = "Select an option...";
      this.#valueDisplay.classList.add("placeholder");
    }
  }

  #selectOption(value: string) {
    this.value = value;
    this.#select.value = value;
    this.#updateDisplay();
    // Close dropdown immediately
    this.open = false;
    // Prevent any delayed reopening
    setTimeout(() => {
      if (this.open) {
        this.open = false;
      }
    }, 0);
    emit(this, "gl-change", { value });
  }

  #navigateOptions(direction: number) {
    if (this.#options.length === 0) return;
    
    this.#selectedIndex += direction;
    if (this.#selectedIndex < 0) this.#selectedIndex = this.#options.length - 1;
    if (this.#selectedIndex >= this.#options.length) this.#selectedIndex = 0;
    
    this.#updateSelection();
    const option = this.#options[this.#selectedIndex];
    if (option) option.scrollIntoView({ block: "nearest" });
  }

  #updateSelection() {
    this.#options.forEach((opt, index) => {
      opt.setAttribute("aria-selected", String(index === this.#selectedIndex));
      opt.setAttribute("tabindex", index === this.#selectedIndex ? "0" : "-1");
    });
  }

  #parseOptions() {
    if (!this.#select || !this.#dropdown) return;
    
    // Clear existing options
    this.#select.innerHTML = "";
    this.#dropdown.innerHTML = "";
    this.#options = [];

    const optionsAttr = this.getAttribute("options");
    if (optionsAttr) {
      try {
        const parsed = JSON.parse(optionsAttr) as Array<{
          value: string;
          label: string;
          disabled?: boolean;
        }>;
        for (const opt of parsed) {
          const o = document.createElement("option");
          o.value = opt.value;
          o.textContent = opt.label;
          if (opt.disabled) o.disabled = true;
          this.#select.appendChild(o);
          
          const div = document.createElement("div");
          div.className = "option";
          div.setAttribute("role", "option");
          div.setAttribute("aria-selected", "false");
          div.setAttribute("tabindex", "-1");
          div.textContent = opt.label;
          div.dataset.value = opt.value;
          if (opt.disabled) {
            div.setAttribute("disabled", "");
          }
          
          div.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!opt.disabled) {
              this.#selectOption(opt.value);
            }
          });
          
          div.addEventListener("mouseenter", () => {
            this.#selectedIndex = this.#options.indexOf(div);
            this.#updateSelection();
          });
          
          this.#dropdown.appendChild(div);
          this.#options.push(div);
        }
      } catch {
        // ignore
      }
    }
  }
}
