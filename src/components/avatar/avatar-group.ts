const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-flex;align-items:center}
    .group{
      display:flex;
      align-items:center;
      gap:calc(var(--gl-avatar-size, 40px) * -0.3);
    }
    ::slotted(gl-avatar){
      border:2px solid var(--gl-panel);
      margin-left:calc(var(--gl-avatar-size, 40px) * -0.3);
      transition:transform var(--gl-dur-2) var(--gl-ease);
    }
    ::slotted(gl-avatar:first-child){
      margin-left:0;
    }
    :host([motion="subtle"]:hover) ::slotted(gl-avatar:hover){
      transform:scale(1.1) translateY(-2px);
      z-index:1;
    }
    :host([motion="snappy"]:hover) ::slotted(gl-avatar:hover){
      transform:scale(1.15) translateY(-4px);
      z-index:1;
    }
    :host([max]) .group::after{
      content:"+\\A" attr(data-remaining);
      white-space:pre;
      display:flex;
      align-items:center;
      justify-content:center;
      width:var(--gl-avatar-size, 40px);
      height:var(--gl-avatar-size, 40px);
      border-radius:50%;
      background:var(--gl-panel);
      border:2px solid var(--gl-border);
      font-size:var(--gl-text-sm);
      font-weight:600;
      color:var(--gl-muted);
      margin-left:calc(var(--gl-avatar-size, 40px) * -0.3);
    }
    :host([size="sm"]){--gl-avatar-size:32px}
    :host([size="md"]){--gl-avatar-size:40px}
    :host([size="lg"]){--gl-avatar-size:56px}
    :host([size="xl"]){--gl-avatar-size:80px}
  </style>
  <div class="group" part="group">
    <slot></slot>
  </div>
`;

export class GlAvatarGroup extends HTMLElement {
  static tagName = "gl-avatar-group";
  static get observedAttributes() {
    return ["max", "size"];
  }

  #group!: HTMLElement;
  #observer?: MutationObserver;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#group = this.shadowRoot!.querySelector(".group") as HTMLElement;
    
    this.#observer = new MutationObserver(() => this.#update());
    this.#observer.observe(this, { childList: true, subtree: false });
    
    this.#update();
  }

  disconnectedCallback() {
    if (this.#observer) {
      this.#observer.disconnect();
    }
  }

  attributeChangedCallback() {
    this.#update();
  }

  #update() {
    if (!this.#group) return;
    const max = this.getAttribute("max");
    if (!max) {
      this.#group.removeAttribute("data-remaining");
      return;
    }

    const avatars = Array.from(this.querySelectorAll("gl-avatar"));
    const maxCount = Number(max) || 0;
    
    if (avatars.length > maxCount) {
      const remaining = avatars.length - maxCount;
      this.#group.setAttribute("data-remaining", String(remaining));
      avatars.forEach((avatar, index) => {
        if (index >= maxCount) {
          (avatar as HTMLElement).style.display = "none";
        } else {
          (avatar as HTMLElement).style.display = "";
        }
      });
    } else {
      this.#group.removeAttribute("data-remaining");
      avatars.forEach((avatar) => {
        (avatar as HTMLElement).style.display = "";
      });
    }
  }
}

