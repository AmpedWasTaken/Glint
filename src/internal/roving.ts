export function rovingKeydown(
  e: KeyboardEvent,
  items: HTMLElement[],
  current: HTMLElement,
  opts?: { vertical?: boolean; loop?: boolean }
): void {
  const loop = opts?.loop ?? true;
  const vertical = opts?.vertical ?? false;

  const prevKeys = vertical ? ["ArrowUp", "ArrowLeft"] : ["ArrowLeft", "ArrowUp"];
  const nextKeys = vertical ? ["ArrowDown", "ArrowRight"] : ["ArrowRight", "ArrowDown"];

  const idx = items.indexOf(current);
  if (idx === -1) return;

  if (prevKeys.includes(e.key)) {
    e.preventDefault();
    const next = idx === 0 ? (loop ? items[items.length - 1] : items[0]) : items[idx - 1];
    next?.focus();
    return;
  }

  if (nextKeys.includes(e.key)) {
    e.preventDefault();
    const next =
      idx === items.length - 1 ? (loop ? items[0] : items[items.length - 1]) : items[idx + 1];
    next?.focus();
    return;
  }

  if (e.key === "Home") {
    e.preventDefault();
    items[0]?.focus();
  }

  if (e.key === "End") {
    e.preventDefault();
    items[items.length - 1]?.focus();
  }
}
