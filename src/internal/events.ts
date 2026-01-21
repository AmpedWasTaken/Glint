export function emit<T>(
  el: HTMLElement,
  type: string,
  detail?: T,
  options?: { bubbles?: boolean; composed?: boolean; cancelable?: boolean }
): CustomEvent<T> {
  const ev = new CustomEvent<T>(type, {
    detail,
    bubbles: options?.bubbles ?? true,
    composed: options?.composed ?? true,
    cancelable: options?.cancelable ?? false
  });
  el.dispatchEvent(ev);
  return ev;
}
