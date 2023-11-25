export function byId(id: string) {
  return document.getElementById(id);
}

export function byClass(className: string) {
  return document.querySelectorAll(className)[0];
}

export function on<T extends keyof HTMLElementEventMap>(
  node: Node,
  event: T,
  callback: (this: HTMLInputElement, ev: HTMLElementEventMap[T]) => any
) {
  node.addEventListener(event, callback as EventListener);
}

export function removeAllChildren(node: HTMLElement) {
  if (node.hasChildNodes()) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }
}

type ElementAttributes = { [s: string]: string | number | boolean };

export function createElement<T = HTMLElement>(
  doc: Document,
  parent: HTMLElement | null,
  tagName: string,
  params?: ElementAttributes
) {
  const e = doc.createElement(tagName);

  if (params) {
    for (const key of Object.keys(params)) {
      (e as any)[key] = params[key];
    }
  }

  if (parent) parent.appendChild(e);
  return e as T;
}
