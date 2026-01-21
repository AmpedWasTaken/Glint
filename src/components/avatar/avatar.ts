const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block;position:relative}
    .avatar{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border-radius:50%;
      background:var(--gl-panel);
      color:var(--gl-fg);
      border:2px solid var(--gl-border);
      overflow:hidden;
      font-weight:600;
      transition:transform var(--gl-dur-2) var(--gl-ease), box-shadow var(--gl-dur-2) var(--gl-ease), border-color var(--gl-dur-1) var(--gl-ease);
    }
    :host([motion="subtle"]:hover) .avatar{transform:scale(1.05);box-shadow:var(--gl-shadow-md)}
    :host([motion="snappy"]:hover) .avatar{transform:scale(1.08) rotate(5deg);box-shadow:var(--gl-shadow-lg)}
    :host([motion="bounce"]:hover) .avatar{transform:scale(1.1) translateY(-2px);box-shadow:var(--gl-shadow-lg)}
    :host([size="sm"]) .avatar{width:32px;height:32px;font-size:12px;line-height:16px}
    :host([size="md"]) .avatar{width:40px;height:40px;font-size:14px;line-height:18px}
    :host([size="lg"]) .avatar{width:56px;height:56px;font-size:18px;line-height:22px}
    :host([size="xl"]) .avatar{width:80px;height:80px;font-size:24px;line-height:30px}
    .img{width:100%;height:100%;object-fit:cover;display:block}
    .initials{display:flex;align-items:center;justify-content:center;width:100%;height:100%}
    .status{
      position:absolute;
      bottom:0;
      right:0;
      width:28%;
      height:28%;
      border-radius:50%;
      border:2px solid var(--gl-panel);
      background:var(--gl-muted);
      transition:transform var(--gl-dur-1) var(--gl-ease), box-shadow var(--gl-dur-1) var(--gl-ease);
    }
    :host([motion]:hover) .status{transform:scale(1.15)}
    :host([status="online"]) .status{background:#22c55e}
    :host([status="away"]) .status{background:#f59e0b}
    :host([status="busy"]) .status{background:#ef4444}
    :host([status="offline"]) .status{background:var(--gl-muted)}
    :host([size="sm"]) .status{width:10px;height:10px;border-width:1.5px}
    :host([size="md"]) .status{width:12px;height:12px}
    :host([size="lg"]) .status{width:16px;height:16px}
    :host([size="xl"]) .status{width:20px;height:20px}
  </style>
  <div part="avatar" class="avatar">
    <img part="img" class="img" alt="" style="display:none">
    <span part="initials" class="initials"></span>
  </div>
  <span part="status" class="status" style="display:none"></span>
`;

export class GlAvatar extends HTMLElement {
  static tagName = "gl-avatar";
  static get observedAttributes() {
    return ["src", "alt", "name", "size", "status"];
  }

  #avatar!: HTMLDivElement;
  #img!: HTMLImageElement;
  #initials!: HTMLSpanElement;
  #status!: HTMLSpanElement;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#avatar = this.shadowRoot!.querySelector(".avatar") as HTMLDivElement;
    this.#img = this.shadowRoot!.querySelector(".img") as HTMLImageElement;
    this.#initials = this.shadowRoot!.querySelector(".initials") as HTMLSpanElement;
    this.#status = this.shadowRoot!.querySelector(".status") as HTMLSpanElement;
    this.#update();
  }

  attributeChangedCallback() {
    this.#update();
  }

  #update() {
    if (!this.#avatar) return;
    const src = this.getAttribute("src");
    const name = this.getAttribute("name") || "";
    const alt = this.getAttribute("alt") || name || "";
    const status = this.getAttribute("status");

    if (src) {
      this.#img.src = src;
      this.#img.alt = alt;
      this.#img.style.display = "block";
      this.#initials.style.display = "none";
    } else {
      this.#img.style.display = "none";
      this.#initials.style.display = "flex";
      this.#initials.textContent = this.#getInitials(name);
    }

    if (status) {
      this.#status.style.display = "block";
    } else {
      this.#status.style.display = "none";
    }
  }

  #getInitials(name: string): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0]?.[0];
      const last = parts[parts.length - 1]?.[0];
      if (first && last) return (first + last).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}

