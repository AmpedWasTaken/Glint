import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    form{
      display:grid;
      gap:var(--gl-space-4);
    }
    .errors{
      display:none;
      padding:12px 16px;
      background:color-mix(in srgb, var(--gl-danger) 10%, transparent);
      border:1px solid var(--gl-danger);
      border-radius:6px;
      margin-bottom:16px;
    }
    .errors.show{
      display:block;
      animation:fadeIn 0.15s ease;
    }
    @keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
    .error-list{
      list-style:none;
      padding:0;
      margin:0;
      display:flex;
      flex-direction:column;
      gap:var(--gl-space-1);
    }
    .error-item{
      font-size:var(--gl-text-sm);
      line-height:var(--gl-line-sm);
      color:var(--gl-danger);
    }
    .actions{
      display:flex;
      gap:var(--gl-space-2);
      justify-content:flex-end;
    }
  </style>
  <form part="form" novalidate>
    <div class="errors" part="errors">
      <ul class="error-list" part="error-list"></ul>
    </div>
    <slot></slot>
    <div class="actions" part="actions">
      <slot name="actions"></slot>
    </div>
  </form>
`;

export class GlForm extends HTMLElement {
  static tagName = "gl-form";
  static get observedAttributes() {
    return ["action", "method", "novalidate"];
  }

  #form!: HTMLFormElement;
  #errorsContainer!: HTMLDivElement;
  #errorList!: HTMLUListElement;
  #errors: Map<string, string> = new Map();

  get action() {
    return this.getAttribute("action") ?? "";
  }
  set action(v: string) {
    this.setAttribute("action", v);
  }

  get method() {
    return (this.getAttribute("method") || "post").toLowerCase();
  }
  set method(v: string) {
    this.setAttribute("method", v);
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#form = this.shadowRoot!.querySelector("form")!;
    this.#errorsContainer = this.shadowRoot!.querySelector(".errors") as HTMLDivElement;
    this.#errorList = this.shadowRoot!.querySelector(".error-list") as HTMLUListElement;
    this.#sync();

    this.#form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#handleSubmit();
    });

    this.addEventListener("gl-change", () => {
      this.#clearErrors();
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#form) return;
    const action = this.getAttribute("action");
    if (action !== null) this.#form.action = action;
    this.#form.method = this.method;
    this.#form.noValidate = this.hasAttribute("novalidate");
  }

  #handleSubmit() {
    this.#clearErrors();
    
    if (!this.#validate()) {
      this.#showErrors();
      emit(this, "gl-invalid", { errors: Object.fromEntries(this.#errors) });
      return;
    }

    const formData = this.#getFormData();
    emit(this, "gl-submit", { formData });
    
    if (this.action) {
      this.#submitForm(formData);
    }
  }

  #validate(): boolean {
    this.#errors.clear();
    const inputs = this.querySelectorAll<HTMLElement>("gl-input, gl-textarea, gl-select, gl-checkbox, gl-radio, gl-date-picker, gl-time-picker, gl-color-picker, gl-tag-input, gl-search-input, gl-file-upload");
    
    inputs.forEach(input => {
      if (input.hasAttribute("required") && !this.#hasValue(input)) {
        const name = input.getAttribute("name") || "field";
        this.#errors.set(name, `${name} is required`);
      }
      
      if (input.hasAttribute("error")) {
        const error = input.getAttribute("error");
        const name = input.getAttribute("name") || "field";
        if (error) {
          this.#errors.set(name, error);
        }
      }
      
      if ("checkValidity" in input && typeof input.checkValidity === "function") {
        if (!input.checkValidity()) {
          const name = input.getAttribute("name") || "field";
          if (!this.#errors.has(name)) {
            this.#errors.set(name, "Invalid value");
          }
        }
      }
    });

    return this.#errors.size === 0;
  }

  #hasValue(input: HTMLElement): boolean {
    if (input.tagName === "GL-CHECKBOX" || input.tagName === "GL-RADIO") {
      return input.hasAttribute("checked");
    }
    if (input.tagName === "GL-FILE-UPLOAD") {
      return (input as any).files?.length > 0;
    }
    if (input.tagName === "GL-TAG-INPUT") {
      return (input as any).tags?.length > 0;
    }
    const value = (input as any).value;
    return value !== null && value !== undefined && value !== "";
  }

  #getFormData(): FormData {
    const formData = new FormData();
    const inputs = this.querySelectorAll<HTMLElement>("gl-input, gl-textarea, gl-select, gl-checkbox, gl-radio, gl-date-picker, gl-time-picker, gl-color-picker, gl-tag-input, gl-search-input");
    
    inputs.forEach(input => {
      const name = input.getAttribute("name");
      if (!name) return;
      
      if (input.tagName === "GL-CHECKBOX" || input.tagName === "GL-RADIO") {
        if (input.hasAttribute("checked")) {
          const value = (input as any).value || "on";
          formData.append(name, value);
        }
      } else if (input.tagName === "GL-FILE-UPLOAD") {
        const files = (input as any).files || [];
        files.forEach((file: File) => {
          formData.append(name, file);
        });
      } else if (input.tagName === "GL-TAG-INPUT") {
        const tags = (input as any).tags || [];
        formData.append(name, JSON.stringify(tags));
      } else {
        const value = (input as any).value || "";
        if (value) {
          formData.append(name, value);
        }
      }
    });
    
    return formData;
  }

  #submitForm(formData: FormData) {
    if (this.method === "get") {
      const params = new URLSearchParams();
      formData.forEach((value, key) => {
        params.append(key, value.toString());
      });
      window.location.href = `${this.action}?${params.toString()}`;
    } else {
      fetch(this.action, {
        method: this.method.toUpperCase(),
        body: formData
      }).then(response => {
        if (response.ok) {
          emit(this, "gl-submit-success", { response });
        } else {
          emit(this, "gl-submit-error", { response });
        }
      }).catch(error => {
        emit(this, "gl-submit-error", { error });
      });
    }
  }

  #showErrors() {
    this.#errorList.innerHTML = "";
    this.#errors.forEach((message, field) => {
      const item = document.createElement("li");
      item.className = "error-item";
      item.textContent = `${field}: ${message}`;
      this.#errorList.appendChild(item);
    });
    this.#errorsContainer.classList.add("show");
  }

  #clearErrors() {
    this.#errors.clear();
    this.#errorList.innerHTML = "";
    this.#errorsContainer.classList.remove("show");
  }

  validate(): boolean {
    return this.#validate();
  }

  reset() {
    this.#form.reset();
    const inputs = this.querySelectorAll<HTMLElement>("gl-input, gl-textarea, gl-select, gl-checkbox, gl-radio, gl-date-picker, gl-time-picker, gl-color-picker, gl-tag-input, gl-search-input");
    inputs.forEach(input => {
      if (input.tagName === "GL-CHECKBOX" || input.tagName === "GL-RADIO") {
        input.removeAttribute("checked");
      } else {
        (input as any).value = "";
      }
    });
    this.#clearErrors();
    emit(this, "gl-reset");
  }

  submit() {
    this.#handleSubmit();
  }
}

