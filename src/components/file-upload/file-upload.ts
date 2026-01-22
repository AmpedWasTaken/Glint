import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:block}
    .wrap{display:grid;gap:var(--gl-space-2)}
    .label{font-size:var(--gl-text-md);line-height:var(--gl-line-md);color:var(--gl-fg)}
    .desc{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm);color:var(--gl-muted)}
    .dropzone{
      border:2px dashed var(--gl-border);
      border-radius:8px;
      padding:48px 24px;
      text-align:center;
      cursor:pointer;
      transition:border-color 0.2s ease, background 0.2s ease;
      background:var(--gl-panel);
    }
    .dropzone:hover{
      background:var(--gl-hover);
      border-color:var(--gl-ring);
    }
    .dropzone.dragover{
      background:color-mix(in srgb, var(--gl-primary) 5%, var(--gl-panel));
      border-color:var(--gl-primary);
      border-style:solid;
    }
    .dropzone-content{display:flex;flex-direction:column;align-items:center;gap:var(--gl-space-2)}
    .dropzone-icon{font-size:32px;opacity:0.7;transition:transform 0.2s ease}
    .dropzone:hover .dropzone-icon{transform:scale(1.1)}
    :host([size="sm"]) .dropzone{padding:32px 20px}
    :host([size="sm"]) .dropzone-icon{font-size:24px}
    :host([size="lg"]) .dropzone{padding:64px 32px}
    :host([size="lg"]) .dropzone-icon{font-size:48px}
    .dropzone-text{font-size:var(--gl-text-md);line-height:var(--gl-line-md);color:var(--gl-fg)}
    .dropzone-hint{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm);color:var(--gl-muted)}
    input[type="file"]{position:absolute;opacity:0;pointer-events:none;width:0;height:0}
    .files{display:grid;gap:var(--gl-space-2);margin-top:var(--gl-space-3);pointer-events:auto}
    .file-item{
      display:flex;
      align-items:center;
      gap:12px;
      padding:12px;
      background:var(--gl-panel);
      border:1px solid var(--gl-border);
      border-radius:6px;
      transition:background 0.15s ease, border-color 0.15s ease;
    }
    .file-item:hover{
      background:var(--gl-hover);
      border-color:color-mix(in srgb, var(--gl-border) 80%, var(--gl-fg));
    }
    .file-preview{
      width:48px;
      height:48px;
      border-radius:6px;
      object-fit:cover;
      background:var(--gl-hover);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:24px;
      border:1px solid var(--gl-border);
      flex-shrink:0;
    }
    .file-info{flex:1;min-width:0}
    .file-name{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm);color:var(--gl-fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .file-size{font-size:var(--gl-text-xs);line-height:var(--gl-line-xs);color:var(--gl-muted)}
    .file-remove{
      cursor:pointer;
      color:var(--gl-muted);
      transition:color 0.15s ease, background 0.15s ease;
      padding:4px;
      border-radius:4px;
      width:24px;
      height:24px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      font-size:18px;
      line-height:1;
    }
    .file-remove:hover{
      color:var(--gl-danger);
      background:color-mix(in srgb, var(--gl-danger) 10%, transparent);
    }
    :host([disabled]){opacity:0.65}
    :host([disabled]) .dropzone{cursor:not-allowed}
    :host([disabled]) .file-remove{pointer-events:none}
    .message{font-size:var(--gl-text-sm);line-height:var(--gl-line-sm)}
    :host([error]) .message{color:var(--gl-danger)}
    .progress{width:100%;height:4px;background:var(--gl-hover);border-radius:var(--gl-radius-sm);overflow:hidden;margin-top:var(--gl-space-1)}
    .progress-bar{height:100%;background:var(--gl-primary);transition:width var(--gl-dur-1) var(--gl-ease)}
  </style>
  <label part="label" class="wrap">
    <span part="label-text" class="label"><slot name="label"></slot></span>
    <span part="description" class="desc"><slot name="description"></slot></span>
    <div part="dropzone" class="dropzone">
      <input part="input" type="file" multiple accept="" />
      <div class="dropzone-content">
        <div class="dropzone-icon">📁</div>
        <div class="dropzone-text">Drop files here or click to browse</div>
        <div class="dropzone-hint">Supports multiple files</div>
      </div>
    </div>
    <div class="files" part="files"></div>
    <span part="message" class="message" aria-live="polite"></span>
  </label>
`;

export class GlFileUpload extends HTMLElement {
  static tagName = "gl-file-upload";
  static get observedAttributes() {
    return [
      "accept",
      "multiple",
      "disabled",
      "name",
      "max-size",
      "max-files",
      "error",
      "size"
    ];
  }

  #input!: HTMLInputElement;
  #dropzone!: HTMLDivElement;
  #filesContainer!: HTMLDivElement;
  #message!: HTMLSpanElement;
  #files: File[] = [];
  #fileElements: Map<File, HTMLDivElement> = new Map();

  get files() {
    return [...this.#files];
  }

  override focus(options?: FocusOptions) {
    this.#input?.focus(options);
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#input = this.shadowRoot!.querySelector("input[type='file']")!;
    this.#dropzone = this.shadowRoot!.querySelector(".dropzone") as HTMLDivElement;
    this.#filesContainer = this.shadowRoot!.querySelector(".files") as HTMLDivElement;
    this.#message = this.shadowRoot!.querySelector(".message") as HTMLSpanElement;
    this.#sync();

    this.#dropzone.addEventListener("click", (e) => {
      // Don't trigger if clicking on file items or remove buttons
      const target = e.target as HTMLElement;
      if (target.closest(".file-item") || target.closest(".file-remove") || target.closest(".files")) {
        return;
      }
      // Only trigger if clicking directly on dropzone or its content
      if (!this.hasAttribute("disabled")) {
        e.stopPropagation();
        this.#input.click();
      }
    });

    this.#input.addEventListener("change", (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        this.#handleFiles(files);
        // Reset input to allow selecting the same file again
        this.#input.value = "";
      }
    });

    this.#dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!this.hasAttribute("disabled")) {
        this.#dropzone.classList.add("dragover");
      }
    });

    this.#dropzone.addEventListener("dragleave", () => {
      this.#dropzone.classList.remove("dragover");
    });

    this.#dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      this.#dropzone.classList.remove("dragover");
      if (!this.hasAttribute("disabled")) {
        const files = Array.from(e.dataTransfer?.files || []);
        this.#handleFiles(files);
      }
    });
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #handleFiles(files: File[]) {
    const maxFiles = this.getAttribute("max-files");
    if (maxFiles && this.#files.length + files.length > Number(maxFiles)) {
      this.setAttribute("error", `Maximum ${maxFiles} files allowed`);
      return;
    }

    const maxSize = this.getAttribute("max-size");
    const accept = this.getAttribute("accept");

    for (const file of files) {
      if (maxSize && file.size > Number(maxSize)) {
        this.setAttribute("error", `File ${file.name} exceeds maximum size`);
        continue;
      }

      if (accept && !this.#matchesAccept(file, accept)) {
        this.setAttribute("error", `File ${file.name} is not an accepted type`);
        continue;
      }

      this.#files.push(file);
      this.#renderFile(file);
      emit(this, "gl-file-add", { file, files: [...this.#files] });
    }

    this.removeAttribute("error");
    emit(this, "gl-change", { files: [...this.#files] });
  }

  #matchesAccept(file: File, accept: string): boolean {
    const types = accept.split(",").map(t => t.trim());
    return types.some(type => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes("/*")) {
        const base = type.split("/")[0];
        return file.type.startsWith(base + "/");
      }
      return file.type === type;
    });
  }

  #renderFile(file: File) {
    const item = document.createElement("div");
    item.className = "file-item";
    item.setAttribute("part", "file-item");

    let preview: HTMLDivElement | HTMLImageElement = document.createElement("div");
    preview.className = "file-preview";
    
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.className = "file-preview";
      img.onload = () => URL.revokeObjectURL(img.src);
      preview = img;
    } else {
      (preview as HTMLDivElement).textContent = this.#getFileIcon(file);
    }

    const info = document.createElement("div");
    info.className = "file-info";
    
    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file.name;
    
    const size = document.createElement("div");
    size.className = "file-size";
    size.textContent = this.#formatFileSize(file.size);
    
    info.appendChild(name);
    info.appendChild(size);

    const remove = document.createElement("span");
    remove.className = "file-remove";
    remove.setAttribute("role", "button");
    remove.setAttribute("tabindex", "0");
    remove.setAttribute("aria-label", `Remove ${file.name}`);
    remove.textContent = "×";
    
    remove.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.#removeFile(file);
    });
    
    remove.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        this.#removeFile(file);
      }
    });

    item.appendChild(preview);
    item.appendChild(info);
    item.appendChild(remove);
    
    this.#filesContainer.appendChild(item);
    this.#fileElements.set(file, item);
  }

  #removeFile(file: File) {
    const index = this.#files.indexOf(file);
    if (index > -1) {
      this.#files.splice(index, 1);
      const element = this.#fileElements.get(file);
      if (element) {
        element.remove();
        this.#fileElements.delete(file);
      }
      emit(this, "gl-file-remove", { file, files: [...this.#files] });
      emit(this, "gl-change", { files: [...this.#files] });
    }
  }

  #getFileIcon(file: File): string {
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type.startsWith("video/")) return "🎥";
    if (file.type.startsWith("audio/")) return "🎵";
    if (file.type.includes("pdf")) return "📄";
    if (file.type.includes("zip") || file.type.includes("archive")) return "📦";
    return "📁";
  }

  #formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }

  #sync() {
    if (!this.#input) return;
    const accept = this.getAttribute("accept");
    if (accept !== null) this.#input.accept = accept;
    this.#input.multiple = this.hasAttribute("multiple");
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

