import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .calendar {
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      padding: var(--gl-space-4);
    }
    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--gl-space-4);
    }
    .calendar-nav {
      width: 32px;
      height: 32px;
      border-radius: var(--gl-radius);
      border: 1px solid var(--gl-border);
      background: var(--gl-panel);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--gl-dur-1) var(--gl-ease);
    }
    .calendar-nav:hover {
      background: var(--gl-hover);
    }
    .calendar-nav svg {
      width: 16px;
      height: 16px;
    }
    .calendar-title {
      font-size: var(--gl-text-lg);
      font-weight: 600;
      flex: 1;
      text-align: center;
    }
    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--gl-space-1);
      margin-bottom: var(--gl-space-2);
    }
    .calendar-weekday {
      text-align: center;
      font-size: var(--gl-text-sm);
      font-weight: 600;
      color: var(--gl-muted);
      padding: var(--gl-space-2);
    }
    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--gl-space-1);
    }
    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--gl-radius);
      cursor: pointer;
      transition: all var(--gl-dur-1) var(--gl-ease);
      font-size: var(--gl-text-sm);
      position: relative;
    }
    .calendar-day:hover {
      background: var(--gl-hover);
    }
    .calendar-day.other-month {
      color: var(--gl-muted);
      opacity: 0.4;
    }
    .calendar-day.today {
      font-weight: 600;
      border: 2px solid var(--gl-primary);
    }
    .calendar-day.selected {
      background: var(--gl-primary);
      color: var(--gl-primary-fg);
    }
    .calendar-day.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .calendar-day.disabled:hover {
      background: transparent;
    }
  </style>
  <div class="calendar" part="calendar">
    <div class="calendar-header" part="header">
      <button class="calendar-nav prev" part="nav-prev" aria-label="Previous month">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="calendar-title" part="title"></div>
      <button class="calendar-nav next" part="nav-next" aria-label="Next month">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
    <div class="calendar-weekdays" part="weekdays"></div>
    <div class="calendar-days" part="days"></div>
  </div>
`;

export class GlCalendar extends HTMLElement {
  static tagName = "gl-calendar";
  static get observedAttributes() {
    return ["value", "min", "max"];
  }

  #title!: HTMLElement;
  #prevButton!: HTMLElement;
  #nextButton!: HTMLElement;
  #weekdays!: HTMLElement;
  #days!: HTMLElement;
  #currentDate = new Date();
  #selectedDate?: Date;
  #minDate?: Date;
  #maxDate?: Date;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#title = this.shadowRoot!.querySelector(".calendar-title") as HTMLElement;
    this.#prevButton = this.shadowRoot!.querySelector(".calendar-nav.prev") as HTMLElement;
    this.#nextButton = this.shadowRoot!.querySelector(".calendar-nav.next") as HTMLElement;
    this.#weekdays = this.shadowRoot!.querySelector(".calendar-weekdays") as HTMLElement;
    this.#days = this.shadowRoot!.querySelector(".calendar-days") as HTMLElement;

    this.#prevButton.addEventListener("click", () => this.previousMonth());
    this.#nextButton.addEventListener("click", () => this.nextMonth());

    this.#initWeekdays();
    this.update();
  }

  attributeChangedCallback(name: string) {
    if (name === "value") {
      const value = this.getAttribute("value");
      this.#selectedDate = value ? this.#parseDate(value) : undefined;
      this.update();
    } else if (name === "min") {
      const min = this.getAttribute("min");
      this.#minDate = min ? this.#parseDate(min) : undefined;
      this.update();
    } else if (name === "max") {
      const max = this.getAttribute("max");
      this.#maxDate = max ? this.#parseDate(max) : undefined;
      this.update();
    }
  }

  #parseDate(dateString: string): Date {
    // Parse ISO date string (YYYY-MM-DD) as local date, not UTC
    const parts = dateString.split("-");
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    // Fallback to standard Date parsing
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  #initWeekdays() {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    this.#weekdays.innerHTML = "";
    weekdays.forEach((day) => {
      const div = document.createElement("div");
      div.className = "calendar-weekday";
      div.textContent = day;
      this.#weekdays.appendChild(div);
    });
  }

  update() {
    const year = this.#currentDate.getFullYear();
    const month = this.#currentDate.getMonth();
    
    this.#title.textContent = new Date(year, month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    this.#days.innerHTML = "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const day = date.getDate();
      const isOtherMonth = date.getMonth() !== month;
      
      const dateForComparison = new Date(date);
      dateForComparison.setHours(0, 0, 0, 0);
      const todayForComparison = new Date(today);
      todayForComparison.setHours(0, 0, 0, 0);
      const isToday = dateForComparison.getTime() === todayForComparison.getTime();
      
      let isSelected = false;
      if (this.#selectedDate) {
        const selectedForComparison = new Date(this.#selectedDate);
        selectedForComparison.setHours(0, 0, 0, 0);
        isSelected = dateForComparison.getTime() === selectedForComparison.getTime();
      }
      
      const isDisabled = this.#isDisabled(date);

      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";
      dayEl.textContent = String(day);
      
      if (isOtherMonth) dayEl.classList.add("other-month");
      if (isToday) dayEl.classList.add("today");
      if (isSelected) dayEl.classList.add("selected");
      if (isDisabled) dayEl.classList.add("disabled");

      if (!isDisabled) {
        dayEl.addEventListener("click", () => {
          const clickDate = new Date(date);
          clickDate.setHours(0, 0, 0, 0);
          this.selectDate(clickDate);
        });
      }

      this.#days.appendChild(dayEl);
    }
  }

  #isDisabled(date: Date): boolean {
    if (this.#minDate && date < this.#minDate) return true;
    if (this.#maxDate && date > this.#maxDate) return true;
    return false;
  }

  selectDate(date: Date) {
    const dateForSelection = new Date(date);
    dateForSelection.setHours(0, 0, 0, 0);
    this.#selectedDate = dateForSelection;
    // Format as local date string (YYYY-MM-DD) to avoid UTC conversion issues
    const year = dateForSelection.getFullYear();
    const month = String(dateForSelection.getMonth() + 1).padStart(2, "0");
    const day = String(dateForSelection.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    this.setAttribute("value", dateStr);
    this.update();
    emit(this, "gl-calendar-select", { date: dateStr });
  }

  previousMonth() {
    this.#currentDate.setMonth(this.#currentDate.getMonth() - 1);
    this.update();
  }

  nextMonth() {
    this.#currentDate.setMonth(this.#currentDate.getMonth() + 1);
    this.update();
  }
}

