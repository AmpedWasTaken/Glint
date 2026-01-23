import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .stepper {
      display: flex;
      flex-direction: column;
      gap: var(--gl-space-4);
    }
    .steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      padding: 0 var(--gl-space-4);
    }
    ::slotted(gl-stepper-step) {
      flex: 1;
      display: block;
      position: relative;
      z-index: 1;
    }
    .steps::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gl-border);
      z-index: 0;
      transform: translateY(-50%);
    }
    :host([variant="vertical"]) .steps {
      flex-direction: column;
      align-items: flex-start;
      padding: var(--gl-space-4) 0;
    }
    :host([variant="vertical"]) .steps::before {
      top: 0;
      bottom: 0;
      left: 50%;
      width: 2px;
      height: auto;
      transform: translateX(-50%);
    }
    .step {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gl-space-2);
      flex: 1;
    }
    :host([variant="vertical"]) .step {
      flex-direction: row;
      width: 100%;
      align-items: flex-start;
    }
    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--gl-text-md);
      background: var(--gl-panel);
      border: 2px solid var(--gl-border);
      color: var(--gl-muted);
      transition: all var(--gl-dur-2) var(--gl-ease-out);
      flex-shrink: 0;
    }
    .step[data-state="active"] .step-number {
      background: var(--gl-primary);
      border-color: var(--gl-primary);
      color: var(--gl-primary-fg);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--gl-primary) 25%, transparent);
    }
    .step[data-state="completed"] .step-number {
      background: var(--gl-success);
      border-color: var(--gl-success);
      color: var(--gl-success-fg, white);
    }
    .step[data-state="error"] .step-number {
      background: var(--gl-danger);
      border-color: var(--gl-danger);
      color: var(--gl-danger-fg, white);
    }
    .step-label {
      font-size: var(--gl-text-sm);
      color: var(--gl-muted);
      text-align: center;
      transition: color var(--gl-dur-1) var(--gl-ease);
    }
    :host([variant="vertical"]) .step-label {
      text-align: left;
      flex: 1;
      padding-top: var(--gl-space-2);
    }
    .step[data-state="active"] .step-label {
      color: var(--gl-fg);
      font-weight: 600;
    }
    .step[data-state="completed"] .step-label {
      color: var(--gl-success);
    }
    .step[data-state="error"] .step-label {
      color: var(--gl-danger);
    }
    .step-description {
      font-size: var(--gl-text-xs);
      color: var(--gl-muted);
      text-align: center;
      margin-top: -4px;
    }
    :host([variant="vertical"]) .step-description {
      text-align: left;
      margin-top: 2px;
    }
    .content {
      margin-top: var(--gl-space-4);
    }
    .navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--gl-space-2);
      margin-top: var(--gl-space-4);
      padding-top: var(--gl-space-4);
      border-top: 1px solid var(--gl-border);
    }
    .navigation:empty {
      display: none;
    }
    :host([size="sm"]) .step-number {
      width: 32px;
      height: 32px;
      font-size: var(--gl-text-sm);
    }
    :host([size="lg"]) .step-number {
      width: 48px;
      height: 48px;
      font-size: var(--gl-text-lg);
    }
  </style>
  <div class="stepper" part="stepper">
    <div class="steps" part="steps">
      <slot name="steps"></slot>
    </div>
    <div class="content" part="content">
      <slot></slot>
    </div>
    <div class="navigation" part="navigation">
      <slot name="navigation"></slot>
    </div>
  </div>
`;

const stepTemplate = document.createElement("template");
stepTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .step {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gl-space-2);
      flex: 1;
      cursor: pointer;
    }
    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--gl-text-md);
      background: var(--gl-panel);
      border: 2px solid var(--gl-border);
      color: var(--gl-muted);
      transition: all var(--gl-dur-2) var(--gl-ease-out);
    }
    .step[data-state="active"] .step-number {
      background: var(--gl-primary);
      border-color: var(--gl-primary);
      color: var(--gl-primary-fg);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--gl-primary) 25%, transparent);
    }
    .step[data-state="completed"] .step-number {
      background: var(--gl-success);
      border-color: var(--gl-success);
      color: var(--gl-success-fg, white);
    }
    .step[data-state="error"] .step-number {
      background: var(--gl-danger);
      border-color: var(--gl-danger);
      color: var(--gl-danger-fg, white);
    }
    .step-label {
      font-size: var(--gl-text-sm);
      color: var(--gl-muted);
      text-align: center;
      transition: color var(--gl-dur-1) var(--gl-ease);
    }
    .step[data-state="active"] .step-label {
      color: var(--gl-fg);
      font-weight: 600;
    }
    .step-description {
      font-size: var(--gl-text-xs);
      color: var(--gl-muted);
      text-align: center;
      margin-top: -4px;
    }
  </style>
  <div class="step" part="step">
    <div class="step-number" part="number"></div>
    <div class="step-label" part="label"><slot name="label"></slot></div>
    <div class="step-description" part="description"><slot name="description"></slot></div>
  </div>
`;

export class GlStepper extends HTMLElement {
  static tagName = "gl-stepper";
  static get observedAttributes() {
    return ["current", "variant", "size"];
  }

  #steps: GlStepperStep[] = [];
  #navigationButtons: Set<HTMLElement> = new Set();

  get current() {
    return Number(this.getAttribute("current")) || 0;
  }
  set current(v: number) {
    this.setAttribute("current", String(Math.max(0, v)));
  }

  #observer?: MutationObserver;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    // Wait for DOM to be ready
    requestAnimationFrame(() => {
      this.#updateSteps();
      this.#wireNavigationButtons();
    });

    // Watch for step changes
    this.#observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        this.#updateSteps();
      });
    });
    this.#observer.observe(this, { childList: true, subtree: false });
    
    // Watch for slot changes
    const stepsSlot = this.shadowRoot!.querySelector('slot[name="steps"]') as HTMLSlotElement;
    if (stepsSlot) {
      stepsSlot.addEventListener("slotchange", () => {
        requestAnimationFrame(() => {
          this.#updateSteps();
        });
      });
    }

    // Watch for navigation slot changes
    const navigationSlot = this.shadowRoot!.querySelector('slot[name="navigation"]') as HTMLSlotElement;
    if (navigationSlot) {
      navigationSlot.addEventListener("slotchange", () => {
        requestAnimationFrame(() => {
          this.#wireNavigationButtons();
        });
      });
    }
  }

  disconnectedCallback() {
    if (this.#observer) {
      this.#observer.disconnect();
    }
    // Clean up navigation button listeners
    this.#navigationButtons.forEach(button => {
      button.removeEventListener("click", this.#handleNavigationClick);
    });
    this.#navigationButtons.clear();
  }

  attributeChangedCallback() {
    this.#updateSteps();
  }

  #updateSteps() {
    const stepsSlot = this.shadowRoot!.querySelector('slot[name="steps"]') as HTMLSlotElement;
    if (!stepsSlot) return;

    const assignedNodes = stepsSlot.assignedNodes();
    this.#steps = assignedNodes.filter(
      (node) => node instanceof GlStepperStep
    ) as GlStepperStep[];

    const current = this.current;
    this.#steps.forEach((step, index) => {
      let state: "pending" | "active" | "completed" | "error" = "pending";
      if (index < current) {
        state = step.hasAttribute("error") ? "error" : "completed";
      } else if (index === current) {
        state = "active";
      }
      step.setState(state);
      step.setNumber(index + 1);
    });
  }

  #wireNavigationButtons() {
    // Clear existing listeners
    this.#navigationButtons.forEach(button => {
      button.removeEventListener("click", this.#handleNavigationClick);
    });
    this.#navigationButtons.clear();

    const navigationSlot = this.shadowRoot!.querySelector('slot[name="navigation"]') as HTMLSlotElement;
    if (!navigationSlot) return;

    const assignedNodes = navigationSlot.assignedNodes();
    
    // Find all buttons in the navigation slot
    const findButtons = (nodes: Node[]): HTMLElement[] => {
      const buttons: HTMLElement[] = [];
      nodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          // Check if it's a button or gl-button
          if (element.tagName === "BUTTON" || element.tagName === "GL-BUTTON" || 
              element.getAttribute("role") === "button" ||
              element.hasAttribute("data-stepper-action")) {
            buttons.push(element);
          }
          // Also search children
          if (element.children) {
            buttons.push(...findButtons(Array.from(element.children)));
          }
        }
      });
      return buttons;
    };

    const buttons = findButtons(Array.from(assignedNodes));
    
    buttons.forEach(button => {
      // Check for data attribute first
      const action = button.getAttribute("data-stepper-action");
      if (action === "next" || action === "previous") {
        button.addEventListener("click", this.#handleNavigationClick);
        this.#navigationButtons.add(button);
        return;
      }

      // Check button text content
      const text = button.textContent?.trim().toLowerCase() || "";
      if (text === "next" || text.includes("next")) {
        button.addEventListener("click", this.#handleNavigationClick);
        this.#navigationButtons.add(button);
      } else if (text === "previous" || text === "prev" || text.includes("previous") || text.includes("back")) {
        button.addEventListener("click", this.#handleNavigationClick);
        this.#navigationButtons.add(button);
      }
    });
  }

  #handleNavigationClick = (e: Event) => {
    const button = e.target as HTMLElement;
    const action = button.getAttribute("data-stepper-action");
    const text = button.textContent?.trim().toLowerCase() || "";

    if (action === "next" || (!action && (text === "next" || text.includes("next")))) {
      e.preventDefault();
      e.stopPropagation();
      this.next();
    } else if (action === "previous" || (!action && (text === "previous" || text === "prev" || text.includes("previous") || text.includes("back")))) {
      e.preventDefault();
      e.stopPropagation();
      this.previous();
    }
  };

  next() {
    // Ensure steps are updated
    this.#updateSteps();
    if (this.#steps.length === 0) return;
    
    if (this.current < this.#steps.length - 1) {
      this.current++;
      emit(this, "gl-step-change", { step: this.current });
    }
  }

  previous() {
    // Ensure steps are updated
    this.#updateSteps();
    if (this.#steps.length === 0) return;
    
    if (this.current > 0) {
      this.current--;
      emit(this, "gl-step-change", { step: this.current });
    }
  }

  goTo(step: number) {
    if (step >= 0 && step < this.#steps.length) {
      this.current = step;
      emit(this, "gl-step-change", { step });
    }
  }
}

export class GlStepperStep extends HTMLElement {
  static tagName = "gl-stepper-step";

  #step!: HTMLElement;
  #number!: HTMLElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(stepTemplate.content.cloneNode(true));
    this.#step = this.shadowRoot!.querySelector(".step") as HTMLElement;
    this.#number = this.shadowRoot!.querySelector(".step-number") as HTMLElement;

    this.#step.addEventListener("click", () => {
      const stepper = this.closest("gl-stepper") as GlStepper;
      if (stepper) {
        // Get all steps from the stepper
        const stepsSlot = stepper.shadowRoot?.querySelector('slot[name="steps"]') as HTMLSlotElement;
        if (stepsSlot) {
          const assignedNodes = stepsSlot.assignedNodes();
          const steps = assignedNodes.filter(
            (node) => node instanceof GlStepperStep
          ) as GlStepperStep[];
          const index = steps.indexOf(this);
          if (index !== -1) {
            stepper.goTo(index);
          }
        }
      }
    });

    // Notify parent stepper when step is connected by triggering attribute change
    requestAnimationFrame(() => {
      const stepper = this.closest("gl-stepper") as GlStepper;
      if (stepper) {
        // Trigger update by setting current to itself
        const current = stepper.current;
        stepper.current = current;
      }
    });
  }

  setState(state: "pending" | "active" | "completed" | "error") {
    if (this.#step) {
      this.#step.setAttribute("data-state", state);
    }
  }

  setNumber(num: number) {
    if (this.#number) {
      this.#number.textContent = String(num);
    }
  }
}

