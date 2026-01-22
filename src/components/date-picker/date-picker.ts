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
    input{
      all:unset;
      flex:1;
      font-size:var(--gl-text-md);
      line-height:var(--gl-line-md);
      min-width:0;
    }
    input::placeholder{color:color-mix(in srgb, var(--gl-muted) 80%, transparent)}
    .picker{
      position:fixed;
      left:0;
      top:0;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:8px;
      box-shadow:0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      padding:8px;
      z-index:var(--gl-z-popover);
      display:none;
      min-width:260px;
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
    .header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:8px;
      padding-bottom:6px;
      border-bottom:1px solid var(--gl-border);
    }
    .nav-btn{
      all:unset;
      cursor:pointer;
      padding:3px 5px;
      border-radius:4px;
      transition:background 0.15s ease, color 0.15s ease;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:24px;
      height:24px;
      color:var(--gl-muted);
      font-size:14px;
      line-height:1;
    }
    .nav-btn:hover{
      background:var(--gl-hover);
      color:var(--gl-fg);
    }
    .nav-btn:focus-visible{
      outline:2px solid var(--gl-ring);
      outline-offset:2px;
    }
    .month-year{
      font-size:13px;
      line-height:16px;
      font-weight:600;
      color:var(--gl-fg);
    }
    .calendar{
      display:grid;
      grid-template-columns:repeat(7, 1fr);
      gap:1px;
      margin-bottom:6px;
    }
    .day-header{
      text-align:center;
      font-size:9px;
      line-height:12px;
      color:var(--gl-muted);
      padding:4px 1px;
      font-weight:600;
      text-transform:uppercase;
      letter-spacing:0.5px;
    }
    .day{
      all:unset;
      cursor:pointer;
      text-align:center;
      padding:4px;
      border-radius:3px;
      font-size:12px;
      line-height:16px;
      transition:background 0.15s ease, color 0.15s ease;
      width:28px;
      height:28px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
    }
    .day:hover{
      background:var(--gl-hover);
    }
    .day.other-month{
      color:var(--gl-muted);
      opacity:0.4;
    }
    .day.today{
      font-weight:600;
      border:1px solid var(--gl-border);
      background:var(--gl-hover);
    }
    .day.selected{
      background:var(--gl-primary);
      color:var(--gl-primary-fg);
      font-weight:600;
    }
    .day.range-start,.day.range-end{
      background:var(--gl-primary);
      color:var(--gl-primary-fg);
      font-weight:600;
    }
    .day.in-range{
      background:color-mix(in srgb, var(--gl-primary) 15%, transparent);
    }
    .day.disabled{
      opacity:0.3;
      cursor:not-allowed;
      color:var(--gl-muted);
    }
    .day.disabled:hover{
      background:transparent;
    }
    .day:focus-visible{
      outline:2px solid var(--gl-ring);
      outline-offset:2px;
    }
    .footer{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-top:6px;
      padding-top:6px;
      border-top:1px solid var(--gl-border);
    }
    .quick-actions{
      display:flex;
      gap:8px;
    }
    .quick-btn{
      all:unset;
      cursor:pointer;
      padding:4px 10px;
      border-radius:4px;
      font-size:12px;
      line-height:16px;
      transition:background 0.15s ease, color 0.15s ease;
      color:var(--gl-muted);
    }
    .quick-btn:hover{
      background:var(--gl-hover);
      color:var(--gl-fg);
    }
    .quick-btn:focus-visible{
      outline:2px solid var(--gl-ring);
      outline-offset:2px;
    }
    :host([disabled]){opacity:0.65}
    :host([disabled]) .field{cursor:not-allowed}
    :host([disabled]) input{pointer-events:none}
    .message{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm)}
    :host([error]) .message{color:var(--gl-danger)}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <span part="field" class="field">
      <input part="input" type="text" />
      <slot name="suffix"></slot>
    </span>
    <div class="picker" part="picker">
      <div class="header">
        <button class="nav-btn" part="prev-month" aria-label="Previous month">‹</button>
        <div class="month-year" part="month-year"></div>
        <button class="nav-btn" part="next-month" aria-label="Next month">›</button>
      </div>
      <div class="calendar" part="calendar"></div>
      <div class="footer">
        <div class="quick-actions">
          <button class="quick-btn" part="today">Today</button>
          <button class="quick-btn" part="clear">Clear</button>
        </div>
      </div>
    </div>
    <span part="message" class="message" aria-live="polite"></span>
  </label>
`;

export class GlDatePicker extends HTMLElement {
  static tagName = "gl-date-picker";
  static get observedAttributes() {
    return [
      "value",
      "placeholder",
      "disabled",
      "name",
      "required",
      "format",
      "mode",
      "min",
      "max",
      "error"
    ];
  }

  #input!: HTMLInputElement;
  #field!: HTMLSpanElement;
  #picker!: HTMLDivElement;
  #monthYear!: HTMLDivElement;
  #calendar!: HTMLDivElement;
  #prevBtn!: HTMLButtonElement;
  #nextBtn!: HTMLButtonElement;
  #todayBtn!: HTMLButtonElement;
  #clearBtn!: HTMLButtonElement;
  #message!: HTMLSpanElement;
  #currentDate = new Date();
  #selectedDate: Date | null = null;
  #rangeStart: Date | null = null;
  #rangeEnd: Date | null = null;
  #format = "YYYY-MM-DD";
  #mode: "single" | "range" = "single";
  #minDate?: Date;
  #maxDate?: Date;

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
    this.#field = this.shadowRoot!.querySelector(".field") as HTMLSpanElement;
    this.#picker = this.shadowRoot!.querySelector(".picker") as HTMLDivElement;
    this.#monthYear = this.shadowRoot!.querySelector(".month-year") as HTMLDivElement;
    this.#calendar = this.shadowRoot!.querySelector(".calendar") as HTMLDivElement;
    this.#prevBtn = this.shadowRoot!.querySelector("button[part='prev-month']") as HTMLButtonElement;
    this.#nextBtn = this.shadowRoot!.querySelector("button[part='next-month']") as HTMLButtonElement;
    this.#todayBtn = this.shadowRoot!.querySelector("button[part='today']") as HTMLButtonElement;
    this.#clearBtn = this.shadowRoot!.querySelector("button[part='clear']") as HTMLButtonElement;
    this.#message = this.shadowRoot!.querySelector(".message") as HTMLSpanElement;
    
    this.#format = this.getAttribute("format") || "YYYY-MM-DD";
    this.#mode = (this.getAttribute("mode") as "single" | "range") || "single";
    
    const min = this.getAttribute("min");
    if (min) this.#minDate = new Date(min);
    const max = this.getAttribute("max");
    if (max) this.#maxDate = new Date(max);
    
    this.#sync();
    this.#renderCalendar();

    this.#input.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!this.hasAttribute("disabled")) {
        this.#showPicker();
      }
    });
    this.#input.addEventListener("focus", () => {
      if (!this.hasAttribute("disabled")) {
        this.#showPicker();
      }
    });

    this.#input.addEventListener("change", () => {
      const value = this.#input.value;
      if (this.#parseDate(value)) {
        this.setAttribute("value", value);
        emit(this, "gl-change", { value });
      }
    });

    this.#prevBtn.addEventListener("click", () => {
      this.#currentDate.setMonth(this.#currentDate.getMonth() - 1);
      this.#renderCalendar();
    });

    this.#nextBtn.addEventListener("click", () => {
      this.#currentDate.setMonth(this.#currentDate.getMonth() + 1);
      this.#renderCalendar();
    });

    this.#todayBtn.addEventListener("click", () => {
      const today = new Date();
      if (this.#mode === "range") {
        this.#rangeStart = new Date(today);
        this.#rangeEnd = null;
      } else {
        this.#selectedDate = new Date(today);
        this.#updateInput();
      }
      this.#renderCalendar();
      emit(this, "gl-change", { value: this.#getFormattedValue() });
    });

    this.#clearBtn.addEventListener("click", () => {
      this.#selectedDate = null;
      this.#rangeStart = null;
      this.#rangeEnd = null;
      this.#input.value = "";
      this.setAttribute("value", "");
      this.#renderCalendar();
      emit(this, "gl-change", { value: "" });
    });

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (this.#picker.classList.contains("open")) {
        const isInsideComponent = this.contains(target) || this.shadowRoot?.contains(target);
        const isInsidePicker = this.#picker.contains(target);
        if (!isInsideComponent && !isInsidePicker) {
          this.#hidePicker();
        }
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

    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.#picker.classList.contains("open")) {
        this.#hidePicker();
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #renderCalendar() {
    const year = this.#currentDate.getFullYear();
    const month = this.#currentDate.getMonth();
    
    this.#monthYear.textContent = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    
    this.#calendar.innerHTML = "";
    
    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayHeaders.forEach(day => {
      const header = document.createElement("div");
      header.className = "day-header";
      header.textContent = day;
      this.#calendar.appendChild(header);
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const day = document.createElement("button");
      day.className = "day";
      day.textContent = String(date.getDate());
      day.dataset.date = date.toISOString();
      
      const isOtherMonth = date.getMonth() !== month;
      const isToday = this.#isToday(date);
      const isSelected = this.#isSelected(date);
      const isInRange = this.#isInRange(date);
      const isDisabled = this.#isDisabled(date);
      
      if (isOtherMonth) day.classList.add("other-month");
      if (isToday) day.classList.add("today");
      if (isSelected) day.classList.add("selected");
      if (isInRange) day.classList.add("in-range");
      if (isDisabled) {
        day.classList.add("disabled");
        day.disabled = true;
      }
      
      if (this.#rangeStart && this.#isSameDay(date, this.#rangeStart)) {
        day.classList.add("range-start");
      }
      if (this.#rangeEnd && this.#isSameDay(date, this.#rangeEnd)) {
        day.classList.add("range-end");
      }
      
      if (!isDisabled) {
        day.addEventListener("click", () => {
          this.#selectDate(date);
        });
      }
      
      this.#calendar.appendChild(day);
    }
  }

  #selectDate(date: Date) {
    if (this.#mode === "range") {
      if (!this.#rangeStart || (this.#rangeStart && this.#rangeEnd)) {
        this.#rangeStart = new Date(date);
        this.#rangeEnd = null;
      } else {
        if (date < this.#rangeStart) {
          this.#rangeEnd = new Date(this.#rangeStart);
          this.#rangeStart = new Date(date);
        } else {
          this.#rangeEnd = new Date(date);
        }
      }
      this.#updateInput();
      emit(this, "gl-change", { value: this.#getFormattedValue() });
    } else {
      this.#selectedDate = new Date(date);
      this.#updateInput();
      this.#hidePicker();
      emit(this, "gl-change", { value: this.#getFormattedValue() });
    }
    this.#renderCalendar();
  }

  #updateInput() {
    this.#input.value = this.#getFormattedValue();
    this.setAttribute("value", this.#input.value);
  }

  #getFormattedValue(): string {
    if (this.#mode === "range") {
      if (this.#rangeStart && this.#rangeEnd) {
        return `${this.#formatDate(this.#rangeStart)} - ${this.#formatDate(this.#rangeEnd)}`;
      } else if (this.#rangeStart) {
        return this.#formatDate(this.#rangeStart);
      }
      return "";
    } else {
      return this.#selectedDate ? this.#formatDate(this.#selectedDate) : "";
    }
  }

  #formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return this.#format
      .replace("YYYY", String(year))
      .replace("MM", month)
      .replace("DD", day);
  }

  #parseDate(value: string): boolean {
    if (!value) {
      this.#selectedDate = null;
      this.#rangeStart = null;
      this.#rangeEnd = null;
      return true;
    }
    
    if (this.#mode === "range" && value.includes(" - ")) {
      const [start, end] = value.split(" - ");
      if (start && end) {
        this.#rangeStart = new Date(start);
        this.#rangeEnd = new Date(end);
        return !isNaN(this.#rangeStart.getTime()) && !isNaN(this.#rangeEnd.getTime());
      }
      return false;
    } else {
      this.#selectedDate = new Date(value);
      return !isNaN(this.#selectedDate.getTime());
    }
  }

  #isToday(date: Date): boolean {
    const today = new Date();
    return this.#isSameDay(date, today);
  }

  #isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  #isSelected(date: Date): boolean {
    if (this.#mode === "range") return false;
    return this.#selectedDate ? this.#isSameDay(date, this.#selectedDate) : false;
  }

  #isInRange(date: Date): boolean {
    if (this.#mode !== "range" || !this.#rangeStart || !this.#rangeEnd) return false;
    return date >= this.#rangeStart && date <= this.#rangeEnd;
  }

  #isDisabled(date: Date): boolean {
    if (this.#minDate && date < this.#minDate) return true;
    if (this.#maxDate && date > this.#maxDate) return true;
    return false;
  }

  #showPicker() {
    this.#picker.classList.add("open");
    queueMicrotask(() => this.#positionPicker());
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
    
    // Adjust if would go off screen
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

  #sync() {
    if (!this.#input) return;
    const value = this.getAttribute("value");
    if (value !== null && this.#input.value !== value) {
      this.#input.value = value;
      this.#parseDate(value);
    }
    this.#input.placeholder = this.getAttribute("placeholder") ?? "Select date...";
    this.#input.disabled = this.hasAttribute("disabled");
    this.#input.name = this.getAttribute("name") ?? "";
    this.#input.required = this.hasAttribute("required");
    
    this.#format = this.getAttribute("format") || "YYYY-MM-DD";
    this.#mode = (this.getAttribute("mode") as "single" | "range") || "single";
    
    const min = this.getAttribute("min");
    this.#minDate = min ? new Date(min) : undefined;
    const max = this.getAttribute("max");
    this.#maxDate = max ? new Date(max) : undefined;
    
    const error = this.getAttribute("error");
    if (error !== null && this.#message) {
      this.#message.textContent = error;
    } else if (this.#message) {
      this.#message.textContent = "";
    }
  }
}

