import { emit } from "../../internal/events.js";
import { createFocusTrap } from "../../internal/focus.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{display:inline-block}
    :host{--gl-popover-dur:var(--gl-dur-2);--gl-popover-ease:var(--gl-ease-spring);--gl-popover-amp:1;--gl-popover-offset:8px}
    :host([motion="none"]){--gl-popover-dur:0ms}
    :host([motion="subtle"]){--gl-popover-dur:var(--gl-dur-3);--gl-popover-ease:var(--gl-ease-out);--gl-popover-amp:0.7}
    :host([motion="snappy"]){--gl-popover-dur:var(--gl-dur-2);--gl-popover-ease:var(--gl-ease-spring);--gl-popover-amp:1}
    :host([motion="bounce"]){--gl-popover-dur:var(--gl-dur-4);--gl-popover-ease:var(--gl-ease-bounce);--gl-popover-amp:1.15}
    .trigger{display:inline-flex}
    .panel{
      position:fixed;
      left:0;
      top:0;
      z-index:var(--gl-z-tooltip);
      min-width:240px;
      max-width:min(420px, calc(100vw - 24px));
      background:var(--gl-panel);
      color:var(--gl-fg);
      border:1px solid var(--gl-border);
      border-radius:var(--gl-radius);
      box-shadow:var(--gl-shadow-xl);
      padding:12px;
      display:none;
      opacity:0;
      transform:translateY(calc(-8px * var(--gl-motion) * var(--gl-popover-amp))) scale(0.985);
      transition:opacity var(--gl-popover-dur) var(--gl-popover-ease), transform var(--gl-popover-dur) var(--gl-popover-ease);
      outline:none;
    }
    :host([open]) .panel{display:block;opacity:1;transform:translateY(0) scale(1)}
    :host([motion="bounce"][open]) .panel{transform:translateY(0) scale(1.02)}
    :host([surface="glass"]) .panel{background:var(--gl-glass-bg);border-color:var(--gl-glass-border)}
    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      :host([surface="glass"]) .panel{
        backdrop-filter:blur(var(--gl-glass-blur)) saturate(var(--gl-glass-saturation));
        -webkit-backdrop-filter:blur(var(--gl-glass-blur)) saturate(var(--gl-glass-saturation));
      }
    }
  </style>
  <span part="trigger" class="trigger"><slot name="trigger"></slot></span>
  <div part="panel" class="panel" role="dialog" aria-modal="false" tabindex="-1">
    <slot name="content"></slot>
  </div>
`;

type Side = "bottom" | "top" | "left" | "right";
type Align = "start" | "center" | "end";

export class GlPopover extends HTMLElement {
  static tagName = "gl-popover";
  static get observedAttributes() {
    return ["open", "disabled", "side", "align", "offset", "trap"];
  }

  #trigger!: HTMLElement;
  #panel!: HTMLDivElement;
  #trap = createFocusTrap(document.createElement("div"));
  #onDocPointerDown?: (e: PointerEvent) => void;
  #onDocKeydown?: (e: KeyboardEvent) => void;
  #onReposition?: () => void;
  #id = `gl-popover-${Math.random().toString(16).slice(2)}`;

  get open() {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    if (v) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const root = this.shadowRoot as ShadowRoot;
    if (root.childNodes.length === 0) root.appendChild(template.content.cloneNode(true));
    this.#trigger = root.querySelector(".trigger") as HTMLElement;
    this.#panel = root.querySelector(".panel") as HTMLDivElement;
    this.#panel.id = this.#id;
    this.#trap = createFocusTrap(this.#panel);

    this.#trigger.addEventListener("click", () => this.toggle());
    this.#trigger.addEventListener("keydown", (e) => {
      if (this.hasAttribute("disabled")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === "ArrowDown" && !this.open) {
        e.preventDefault();
        this.show();
      }
    });

    this.addEventListener("keydown", (e) => {
      if (!this.open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this.close("escape");
      }
    });

    this.#sync();
  }

  disconnectedCallback() {
    this.#cleanup();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  show() {
    if (this.hasAttribute("disabled")) return;
    if (this.open) return;
    this.open = true;
  }

  close(reason: "escape" | "outside" | "api" = "api") {
    if (!this.open) return;
    this.open = false;
    emit(this, "gl-close", { reason });
  }

  toggle() {
    if (this.open) this.close("api");
    else this.show();
  }

  #sync() {
    if (!this.#panel || !this.#trigger) return;
    const open = this.open;
    const hasDisabled = this.hasAttribute("disabled");

    const triggerEl = this.#trigger.querySelector<HTMLElement>(":scope > *") ?? this.#trigger;
    if (open) {
      triggerEl.setAttribute("aria-expanded", "true");
      triggerEl.setAttribute("aria-controls", this.#id);
    } else {
      triggerEl.setAttribute("aria-expanded", "false");
      triggerEl.removeAttribute("aria-controls");
    }
    if (hasDisabled) triggerEl.setAttribute("aria-disabled", "true");
    else triggerEl.removeAttribute("aria-disabled");

    if (open) {
      this.#wireGlobalListeners();
      queueMicrotask(() => {
        this.#position();
        emit(this, "gl-open");
        if (this.hasAttribute("trap")) this.#trap.activate();
        else this.#panel.focus();
      });
    } else {
      this.#cleanup();
    }
  }

  #wireGlobalListeners() {
    if (this.#onDocPointerDown || this.#onDocKeydown) return;
    this.#onDocPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (this.contains(t) || this.shadowRoot?.contains(t)) return;
      this.close("outside");
    };
    this.#onDocKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") this.close("escape");
    };
    this.#onReposition = () => this.#position();
    document.addEventListener("pointerdown", this.#onDocPointerDown, true);
    document.addEventListener("keydown", this.#onDocKeydown, true);
    window.addEventListener("resize", this.#onReposition, { passive: true });
    window.addEventListener("scroll", this.#onReposition, { passive: true });
  }

  #cleanup() {
    if (this.#onDocPointerDown) {
      document.removeEventListener("pointerdown", this.#onDocPointerDown, true);
      this.#onDocPointerDown = undefined;
    }
    if (this.#onDocKeydown) {
      document.removeEventListener("keydown", this.#onDocKeydown, true);
      this.#onDocKeydown = undefined;
    }
    if (this.#onReposition) {
      window.removeEventListener("resize", this.#onReposition);
      window.removeEventListener("scroll", this.#onReposition);
      this.#onReposition = undefined;
    }
    this.#trap.deactivate();
  }

  #position() {
    if (!this.open) return;
    const triggerEl = this.#trigger.querySelector<HTMLElement>(":scope > *") ?? this.#trigger;
    const t = triggerEl.getBoundingClientRect();

    const side = (this.getAttribute("side") as Side | null) ?? "bottom";
    const align = (this.getAttribute("align") as Align | null) ?? "start";
    const offsetAttr = this.getAttribute("offset");
    const offset = offsetAttr ? Number(offsetAttr) || 0 : 8;

    // ensure measurable
    const p = this.#panel.getBoundingClientRect();

    let left = 0;
    let top = 0;

    const alignX = () => {
      if (align === "center") return t.left + t.width / 2 - p.width / 2;
      if (align === "end") return t.right - p.width;
      return t.left;
    };
    const alignY = () => {
      if (align === "center") return t.top + t.height / 2 - p.height / 2;
      if (align === "end") return t.bottom - p.height;
      return t.top;
    };

    if (side === "bottom") {
      top = t.bottom + offset;
      left = alignX();
    } else if (side === "top") {
      top = t.top - p.height - offset;
      left = alignX();
    } else if (side === "right") {
      top = alignY();
      left = t.right + offset;
    } else {
      top = alignY();
      left = t.left - p.width - offset;
    }

    const pad = 12;
    left = Math.max(pad, Math.min(window.innerWidth - p.width - pad, left));
    top = Math.max(pad, Math.min(window.innerHeight - p.height - pad, top));

    this.#panel.style.left = `${left}px`;
    this.#panel.style.top = `${top}px`;
  }
}


