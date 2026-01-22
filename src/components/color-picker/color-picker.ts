import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block;position:relative}
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
    .preview{
      width:40px;
      height:40px;
      border-radius:6px;
      border:2px solid var(--gl-border);
      background:var(--gl-panel);
      cursor:pointer;
      flex-shrink:0;
      transition:transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      box-shadow:0 1px 2px rgba(0,0,0,0.05);
      position:relative;
    }
    .preview::after{
      content:"";
      position:absolute;
      inset:0;
      border-radius:4px;
      background:url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e5e7eb' fill-opacity='1'%3E%3Cpath d='M0 0h4v4H0zm4 4h4v4H4z'/%3E%3C/g%3E%3C/svg%3E");
      opacity:0.3;
      pointer-events:none;
    }
    .preview:hover{
      transform:scale(1.08);
      box-shadow:0 4px 8px rgba(0,0,0,0.15);
      border-color:var(--gl-ring);
    }
    .preview:active{transform:scale(0.98)}
    input[type="text"]{
      all:unset;
      flex:1;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      min-width:0;
      font-family:monospace;
    }
    input[type="text"]::placeholder{color:color-mix(in srgb, var(--gl-muted) 80%, transparent)}
    input[type="color"]{
      position:absolute;
      opacity:0;
      pointer-events:none;
      width:0;
      height:0;
    }
    .color-trigger{
      position:absolute;
      inset:0;
      cursor:pointer;
      z-index:1;
    }
    .picker{
      position:fixed;
      left:0;
      top:0;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:8px;
      box-shadow:0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      padding:16px;
      z-index:var(--gl-z-popover);
      display:none;
      min-width:280px;
      backdrop-filter:blur(12px);
      -webkit-backdrop-filter:blur(12px);
    }
    .picker.open{
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
    .hue-slider{
      width:100%;
      height:16px;
      border-radius:8px;
      margin-bottom:12px;
      cursor:pointer;
      background:linear-gradient(to right,
        hsl(0, 100%, 50%),
        hsl(60, 100%, 50%),
        hsl(120, 100%, 50%),
        hsl(180, 100%, 50%),
        hsl(240, 100%, 50%),
        hsl(300, 100%, 50%),
        hsl(360, 100%, 50%)
      );
      border:1px solid var(--gl-border);
      position:relative;
      box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);
    }
    .hue-indicator{
      position:absolute;
      top:50%;
      transform:translate(-50%, -50%);
      width:20px;
      height:20px;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 0 0 1px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.3);
      pointer-events:none;
      z-index:10;
    }
    .color-input{
      width:100%;
      height:160px;
      border-radius:6px;
      border:1px solid var(--gl-border);
      cursor:crosshair;
      position:relative;
      margin-bottom:12px;
      background:
        linear-gradient(to bottom, transparent, rgba(0,0,0,1)),
        linear-gradient(to right, rgba(255,255,255,1), hsl(var(--hue, 0), 100%, 50%));
      overflow:hidden;
    }
    .color-picker-indicator{
      position:absolute;
      width:20px;
      height:20px;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 0 0 1px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.3);
      pointer-events:none;
      transform:translate(-50%, -50%);
      z-index:10;
    }
    .slider{
      width:100%;
      height:16px;
      border-radius:8px;
      margin-bottom:12px;
      cursor:pointer;
      position:relative;
      box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);
    }
    .alpha-slider{
      border:1px solid var(--gl-border);
      background-image:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size:8px 8px;
      background-position:0 0, 0 4px, 4px -4px, -4px 0px;
      position:relative;
    }
    .alpha-slider::after{
      content:"";
      position:absolute;
      inset:0;
      background:linear-gradient(to right, transparent, var(--current-color));
      border-radius:8px;
      pointer-events:none;
    }
    .inputs{
      display:grid;
      grid-template-columns:repeat(4, 1fr);
      gap:var(--gl-space-2);
    }
    .input-group{
      display:flex;
      flex-direction:column;
      gap:var(--gl-space-1);
    }
    .input-label{
      font-size:var(--gl-text-xs);
      line-height:var(--gl-line-xs);
      color:var(--gl-muted);
      text-transform:uppercase;
    }
    .input-field{
      all:unset;
      background:var(--gl-hover);
      border:1px solid var(--gl-border);
      border-radius:4px;
      padding:4px 8px;
      font-size:13px;
      line-height:18px;
      font-family:monospace;
      transition:border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .input-field:hover{border-color:color-mix(in srgb, var(--gl-border) 80%, var(--gl-fg))}
    .input-field:focus{
      border-color:var(--gl-ring);
      box-shadow:0 0 0 3px color-mix(in srgb, var(--gl-ring) 20%, transparent);
      outline:none;
    }
    .format-tabs{
      display:flex;
      gap:4px;
      margin-bottom:12px;
      padding:4px;
      background:var(--gl-hover);
      border-radius:6px;
    }
    .format-tab{
      all:unset;
      padding:6px 12px;
      border-radius:4px;
      font-size:13px;
      line-height:18px;
      cursor:pointer;
      transition:background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
      font-weight:500;
      flex:1;
      text-align:center;
      color:var(--gl-muted);
    }
    .format-tab:hover{
      color:var(--gl-fg);
    }
    .format-tab.active{
      background:var(--gl-panel);
      color:var(--gl-fg);
      box-shadow:0 1px 2px rgba(0,0,0,0.1);
      font-weight:600;
    }
    :host([disabled]){opacity:0.65}
    :host([disabled]) .field{cursor:not-allowed}
    :host([disabled]) input{pointer-events:none}
    :host([disabled]) .preview{pointer-events:none}
    .message{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm)}
    :host([error]) .message{color:var(--gl-danger)}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <div class="preview" part="preview">
        <div class="color-trigger" part="trigger"></div>
      </div>
      <input part="input" type="text" />
      <input type="color" />
    </span>
    <div class="picker" part="picker">
      <div class="format-tabs">
        <button class="format-tab active" data-format="hex">HEX</button>
        <button class="format-tab" data-format="rgb">RGB</button>
        <button class="format-tab" data-format="hsl">HSL</button>
      </div>
      <div class="hue-slider" part="hue-slider">
        <div class="hue-indicator" part="hue-indicator"></div>
      </div>
      <div class="color-input" part="color-input">
        <div class="color-picker-indicator" part="indicator"></div>
      </div>
      <div class="slider alpha-slider" part="alpha-slider"></div>
      <div class="inputs">
        <div class="input-group">
          <span class="input-label">R</span>
          <input class="input-field" part="r-input" type="number" min="0" max="255" value="0" />
        </div>
        <div class="input-group">
          <span class="input-label">G</span>
          <input class="input-field" part="g-input" type="number" min="0" max="255" value="0" />
        </div>
        <div class="input-group">
          <span class="input-label">B</span>
          <input class="input-field" part="b-input" type="number" min="0" max="255" value="0" />
        </div>
        <div class="input-group">
          <span class="input-label">A</span>
          <input class="input-field" part="a-input" type="number" min="0" max="1" step="0.01" value="1" />
        </div>
      </div>
    </div>
    <span part="message" class="message" aria-live="polite"></span>
  </label>
`;

export class GlColorPicker extends HTMLElement {
  static tagName = "gl-color-picker";
  static get observedAttributes() {
    return [
      "value",
      "placeholder",
      "disabled",
      "name",
      "format",
      "error"
    ];
  }

  #input!: HTMLInputElement;
  #colorInput!: HTMLInputElement;
  #field!: HTMLSpanElement;
  #preview!: HTMLDivElement;
  #picker!: HTMLDivElement;
  #colorCanvas!: HTMLDivElement;
  #hueSlider!: HTMLDivElement;
  #alphaSlider!: HTMLDivElement;
  #rInput!: HTMLInputElement;
  #gInput!: HTMLInputElement;
  #bInput!: HTMLInputElement;
  #aInput!: HTMLInputElement;
  #formatTabs!: NodeListOf<HTMLButtonElement>;
  #message!: HTMLSpanElement;
  #format = "hex";
  #currentColor = { r: 0, g: 0, b: 0, a: 1 };
  #currentHue = 0;
  #isUpdating = false;
  #isDragging = false;

  get value() {
    return this.#input?.value ?? this.getAttribute("value") ?? "#000000";
  }
  set value(v: string) {
    this.setAttribute("value", v);
    this.#parseColor(v);
  }

  override focus(options?: FocusOptions) {
    this.#input?.focus(options);
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#input = this.shadowRoot!.querySelector("input[type='text']")!;
    this.#colorInput = this.shadowRoot!.querySelector("input[type='color']")!;
    this.#field = this.shadowRoot!.querySelector(".field") as HTMLSpanElement;
    this.#preview = this.shadowRoot!.querySelector(".preview") as HTMLDivElement;
    this.#picker = this.shadowRoot!.querySelector(".picker") as HTMLDivElement;
    this.#colorCanvas = this.shadowRoot!.querySelector(".color-input") as HTMLDivElement;
    this.#hueSlider = this.shadowRoot!.querySelector(".hue-slider") as HTMLDivElement;
    this.#alphaSlider = this.shadowRoot!.querySelector(".alpha-slider") as HTMLDivElement;
    this.#rInput = this.shadowRoot!.querySelector("input[part='r-input']") as HTMLInputElement;
    this.#gInput = this.shadowRoot!.querySelector("input[part='g-input']") as HTMLInputElement;
    this.#bInput = this.shadowRoot!.querySelector("input[part='b-input']") as HTMLInputElement;
    this.#aInput = this.shadowRoot!.querySelector("input[part='a-input']") as HTMLInputElement;
    this.#formatTabs = this.shadowRoot!.querySelectorAll(".format-tab");
    this.#message = this.shadowRoot!.querySelector(".message") as HTMLSpanElement;
    
    this.#format = this.getAttribute("format") || "hex";
    this.#sync();
    this.#setupEventListeners();
    // Initialize color canvas background and hue from current color
    if (this.#currentColor.r !== 0 || this.#currentColor.g !== 0 || this.#currentColor.b !== 0) {
      const hsl = this.#rgbToHsl(this.#currentColor.r, this.#currentColor.g, this.#currentColor.b);
      this.#currentHue = hsl.h;
      if (this.#colorCanvas) {
        this.#colorCanvas.style.setProperty("--hue", String(this.#currentHue));
      }
      const hueIndicator = this.shadowRoot!.querySelector(".hue-indicator") as HTMLElement;
      if (hueIndicator) {
        hueIndicator.style.left = `${(this.#currentHue / 360) * 100}%`;
      }
    }
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #setupEventListeners() {
    const trigger = this.shadowRoot!.querySelector(".color-trigger") as HTMLDivElement;
    const previewClick = (e: Event) => {
      e.stopPropagation();
      if (!this.hasAttribute("disabled")) {
        const isOpen = this.#picker.classList.contains("open");
        if (isOpen) {
          this.#hidePicker();
        } else {
          this.#showPicker();
        }
      }
    };
    this.#preview.addEventListener("click", previewClick);
    if (trigger) {
      trigger.addEventListener("click", previewClick);
    }
    
    // Also allow clicking the native color input
    this.#colorInput.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!this.hasAttribute("disabled")) {
        this.#showPicker();
      }
    });
    
    // Make color canvas and hue slider interactive
    this.#setupColorCanvas();
    this.#setupHueSlider();

    this.#input.addEventListener("input", () => {
      const value = this.#input.value;
      if (this.#parseColor(value)) {
        this.setAttribute("value", value);
        emit(this, "gl-change", { value });
      }
    });

    this.#colorInput.addEventListener("change", () => {
      const hex = this.#colorInput.value;
      this.value = hex;
      emit(this, "gl-change", { value: hex });
    });

    this.#formatTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        this.#formatTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.#format = tab.dataset.format || "hex";
        this.#updateInput();
      });
    });

    [this.#rInput, this.#gInput, this.#bInput, this.#aInput].forEach(input => {
      input.addEventListener("input", () => {
        if (!this.#isUpdating) {
          this.#currentColor.r = Number(this.#rInput.value) || 0;
          this.#currentColor.g = Number(this.#gInput.value) || 0;
          this.#currentColor.b = Number(this.#bInput.value) || 0;
          this.#currentColor.a = Number(this.#aInput.value) || 1;
          this.#updateFromRGB();
        }
      });
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (!this.#picker.classList.contains("open")) return;
      // Don't close if we're dragging
      if (this.#isDragging) return;
      
      // Use composedPath to properly handle shadow DOM
      const path = e.composedPath();
      const isInsideComponent = path.includes(this) || path.some(node => 
        node instanceof Node && (this.contains(node) || this.shadowRoot?.contains(node))
      );
      const isInsidePicker = path.includes(this.#picker) || path.some(node => 
        node instanceof Node && this.#picker.contains(node)
      );
      
      if (!isInsideComponent && !isInsidePicker) {
        this.#hidePicker();
      }
    };
    const handleReposition = () => {
      if (this.#picker.classList.contains("open")) {
        this.#positionPicker();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    window.addEventListener("resize", handleReposition, { passive: true });
    window.addEventListener("scroll", handleReposition, { passive: true });
  }

  #showPicker() {
    this.#picker.classList.add("open");
    queueMicrotask(() => {
      this.#positionPicker();
      setTimeout(() => this.#rInput?.focus(), 100);
    });
  }

  #hidePicker() {
    this.#picker.classList.remove("open");
  }

  #positionPicker() {
    if (!this.#picker.classList.contains("open")) return;
    const field = this.#field.getBoundingClientRect();
    const picker = this.#picker.getBoundingClientRect();
    
    let left = field.left;
    let top = field.bottom + 8;
    
    const pad = 12;
    if (left + picker.width > window.innerWidth - pad) {
      left = window.innerWidth - picker.width - pad;
    }
    if (left < pad) left = pad;
    
    if (top + picker.height > window.innerHeight - pad) {
      top = field.top - picker.height - 8;
    }
    if (top < pad) top = pad;
    
    this.#picker.style.left = `${left}px`;
    this.#picker.style.top = `${top}px`;
  }

  #setupColorCanvas() {
    if (!this.#colorCanvas) return;
    
    const updateColorFromCanvas = (e: MouseEvent | TouchEvent) => {
      if (!this.#colorCanvas) return;
      const rect = this.#colorCanvas.getBoundingClientRect();
      const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
      const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
      
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      
      // Color calculation: use current hue, saturation from x, lightness from y
      // The canvas visual shows:
      // - Horizontal: white (left, s=0) to hue at 50% lightness (right, s=100%, l=50%)
      // - Vertical: lighter (top) to darker (bottom)
      // So we need to calculate the actual color at this position
      const saturation = x; // 0 to 1
      // Lightness: top should be ~95% (bright hue), bottom should be ~5% (dark hue)
      // The base hue color is at 50% lightness, so we adjust from there
      const baseLightness = 0.5; // Base lightness for the hue color
      const lightnessRange = 0.45; // How much we can vary from base (0.05 to 0.95)
      const lightness = baseLightness + (1 - y) * lightnessRange; // Top (y=0) = 0.95, Bottom (y=1) = 0.05
      
      // Calculate RGB from HSL
      const rgb = this.#hslToRgb(this.#currentHue / 360, saturation, lightness);
      this.#currentColor = { r: rgb.r, g: rgb.g, b: rgb.b, a: this.#currentColor.a };
      this.#updateFromRGB();
      
      // Update indicator position
      const indicator = this.shadowRoot!.querySelector(".color-picker-indicator") as HTMLElement;
      if (indicator) {
        indicator.style.left = `${x * 100}%`;
        indicator.style.top = `${y * 100}%`;
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.#isDragging = true;
      updateColorFromCanvas(e);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (this.#isDragging) {
        e.preventDefault();
        e.stopPropagation();
        updateColorFromCanvas(e);
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (this.#isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.#isDragging = false;
    };
    
    this.#colorCanvas.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    this.#colorCanvas.addEventListener("mouseleave", () => {
      // Don't stop dragging on mouse leave, allow dragging outside
    });
  }

  #setupHueSlider() {
    if (!this.#hueSlider) return;
    
    const updateHue = (e: MouseEvent | TouchEvent) => {
      if (!this.#hueSlider) return;
      const rect = this.#hueSlider.getBoundingClientRect();
      const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      
      this.#currentHue = x * 360;
      
      // Update color canvas background
      if (this.#colorCanvas) {
        this.#colorCanvas.style.setProperty("--hue", String(this.#currentHue));
      }
      
      // Update current color with new hue
      const hsl = this.#rgbToHsl(this.#currentColor.r, this.#currentColor.g, this.#currentColor.b);
      const rgb = this.#hslToRgb(this.#currentHue / 360, hsl.s / 100, hsl.l / 100);
      this.#currentColor = { r: rgb.r, g: rgb.g, b: rgb.b, a: this.#currentColor.a };
      this.#updateFromRGB();
      
      // Update hue indicator position
      const indicator = this.shadowRoot!.querySelector(".hue-indicator") as HTMLElement;
      if (indicator) {
        indicator.style.left = `${x * 100}%`;
      }
    };
    
    this.#hueSlider.addEventListener("mousedown", (e) => {
      this.#isDragging = true;
      updateHue(e);
    });
    
    this.#hueSlider.addEventListener("mousemove", (e) => {
      if (this.#isDragging) {
        updateHue(e);
      }
    });
    
    this.#hueSlider.addEventListener("mouseup", () => {
      this.#isDragging = false;
    });
    
    this.#hueSlider.addEventListener("mouseleave", () => {
      this.#isDragging = false;
    });
  }

  #parseColor(value: string): boolean {
    if (!value) return false;
    
    let r = 0, g = 0, b = 0, a = 1;
    
    if (value.startsWith("#")) {
      const hex = value.slice(1);
      if (hex.length === 3) {
        r = parseInt((hex[0] || "0") + (hex[0] || "0"), 16);
        g = parseInt((hex[1] || "0") + (hex[1] || "0"), 16);
        b = parseInt((hex[2] || "0") + (hex[2] || "0"), 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else {
        return false;
      }
    } else if (value.startsWith("rgb")) {
      const match = value.match(/\d+/g);
      if (match && match.length >= 3) {
        r = Number(match[0]);
        g = Number(match[1]);
        b = Number(match[2]);
        a = match[3] ? Number(match[3]) / 255 : 1;
      } else {
        return false;
      }
    } else if (value.startsWith("hsl")) {
      const match = value.match(/\d+/g);
      if (match && match.length >= 3) {
        const h = Number(match[0]) / 360;
        const s = Number(match[1]) / 100;
        const l = Number(match[2]) / 100;
        const rgb = this.#hslToRgb(h, s, l);
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;
        a = match[3] ? Number(match[3]) / 100 : 1;
      } else {
        return false;
      }
    } else {
      return false;
    }
    
    this.#currentColor = { r, g, b, a };
    this.#updatePreview();
    this.#updateInputs();
    return true;
  }

  #hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  #updateFromRGB() {
    this.#updatePreview();
    this.#updateInput();
    const value = this.#getFormattedValue();
    this.setAttribute("value", value);
    emit(this, "gl-change", { value });
  }

  #updatePreview() {
    const { r, g, b, a } = this.#currentColor;
    const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;
    this.#preview.style.backgroundColor = rgba;
    this.#alphaSlider.style.setProperty("--current-color", rgba);
  }

  #updateInputs() {
    this.#isUpdating = true;
    this.#rInput.value = String(this.#currentColor.r);
    this.#gInput.value = String(this.#currentColor.g);
    this.#bInput.value = String(this.#currentColor.b);
    this.#aInput.value = String(this.#currentColor.a);
    this.#isUpdating = false;
  }

  #updateInput() {
    this.#input.value = this.#getFormattedValue();
    const hex = this.#rgbToHex(this.#currentColor.r, this.#currentColor.g, this.#currentColor.b);
    this.#colorInput.value = hex;
  }

  #getFormattedValue(): string {
    const { r, g, b, a } = this.#currentColor;
    if (this.#format === "hex") {
      return this.#rgbToHex(r, g, b);
    } else if (this.#format === "rgb") {
      return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
    } else {
      const hsl = this.#rgbToHsl(r, g, b);
      return a < 1 ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})` : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
  }

  #rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("")}`;
  }

  #rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  #sync() {
    if (!this.#input) return;
    const value = this.getAttribute("value") || "#000000";
    if (this.#input.value !== value) {
      this.#input.value = value;
      this.#parseColor(value);
    }
    this.#input.placeholder = this.getAttribute("placeholder") ?? "#000000";
    this.#input.disabled = this.hasAttribute("disabled");
    this.#input.name = this.getAttribute("name") ?? "";
    
    const error = this.getAttribute("error");
    if (error !== null && this.#message) {
      this.#message.textContent = error;
    } else if (this.#message) {
      this.#message.textContent = "";
    }
  }
}

