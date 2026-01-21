const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");

export function getFocusable(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    if (el.hasAttribute("inert")) return false;
    const style = getComputedStyle(el);
    return style.visibility !== "hidden" && style.display !== "none";
  });
}

export type FocusTrap = { activate: () => void; deactivate: () => void };

export function createFocusTrap(container: HTMLElement): FocusTrap {
  let lastActive: Element | null = null;
  let active = false;

  function onKeyDown(e: KeyboardEvent) {
    if (!active) return;
    if (e.key !== "Tab") return;

    const focusables = getFocusable(container);
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }

    const current = document.activeElement as HTMLElement | null;
    const idx = current ? focusables.indexOf(current) : -1;
    const nextIdx = e.shiftKey
      ? idx <= 0
        ? focusables.length - 1
        : idx - 1
      : idx === -1 || idx === focusables.length - 1
        ? 0
        : idx + 1;

    e.preventDefault();
    focusables[nextIdx]?.focus();
  }

  return {
    activate() {
      if (active) return;
      active = true;
      lastActive = document.activeElement;
      document.addEventListener("keydown", onKeyDown);
      queueMicrotask(() => {
        const focusables = getFocusable(container);
        (focusables[0] ?? container).focus();
      });
    },
    deactivate() {
      if (!active) return;
      active = false;
      document.removeEventListener("keydown", onKeyDown);
      const toFocus = lastActive as HTMLElement | null;
      if (toFocus?.focus) queueMicrotask(() => toFocus.focus());
      lastActive = null;
    }
  };
}
