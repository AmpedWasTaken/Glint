const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: flex;
    }
    :host([direction="column"]) {
      flex-direction: column;
    }
    :host([direction="row"]) {
      flex-direction: row;
    }
    :host([direction="row-reverse"]) {
      flex-direction: row-reverse;
    }
    :host([direction="column-reverse"]) {
      flex-direction: column-reverse;
    }
    :host([wrap]) {
      flex-wrap: wrap;
    }
    :host([align="start"]) {
      align-items: flex-start;
    }
    :host([align="center"]) {
      align-items: center;
    }
    :host([align="end"]) {
      align-items: flex-end;
    }
    :host([align="stretch"]) {
      align-items: stretch;
    }
    :host([justify="start"]) {
      justify-content: flex-start;
    }
    :host([justify="center"]) {
      justify-content: center;
    }
    :host([justify="end"]) {
      justify-content: flex-end;
    }
    :host([justify="between"]) {
      justify-content: space-between;
    }
    :host([justify="around"]) {
      justify-content: space-around;
    }
    :host([justify="evenly"]) {
      justify-content: space-evenly;
    }
    :host([gap="xs"]) {
      gap: var(--gl-space-1);
    }
    :host([gap="sm"]) {
      gap: var(--gl-space-2);
    }
    :host([gap="md"]) {
      gap: var(--gl-space-3);
    }
    :host([gap="lg"]) {
      gap: var(--gl-space-4);
    }
    :host([gap="xl"]) {
      gap: var(--gl-space-6);
    }
    :host([variant="grid"]) {
      display: grid;
    }
    :host([variant="grid"][columns="1"]) {
      grid-template-columns: repeat(1, 1fr);
    }
    :host([variant="grid"][columns="2"]) {
      grid-template-columns: repeat(2, 1fr);
    }
    :host([variant="grid"][columns="3"]) {
      grid-template-columns: repeat(3, 1fr);
    }
    :host([variant="grid"][columns="4"]) {
      grid-template-columns: repeat(4, 1fr);
    }
    :host([variant="grid"][columns="5"]) {
      grid-template-columns: repeat(5, 1fr);
    }
    :host([variant="grid"][columns="6"]) {
      grid-template-columns: repeat(6, 1fr);
    }
    :host([variant="grid"][columns="12"]) {
      grid-template-columns: repeat(12, 1fr);
    }
    @media (max-width: 768px) {
      :host([variant="grid"][responsive]) {
        grid-template-columns: repeat(1, 1fr);
      }
    }
    @media (min-width: 769px) and (max-width: 1024px) {
      :host([variant="grid"][responsive][columns="3"]),
      :host([variant="grid"][responsive][columns="4"]),
      :host([variant="grid"][responsive][columns="5"]),
      :host([variant="grid"][responsive][columns="6"]) {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
  <slot></slot>
`;

export class GlStack extends HTMLElement {
  static tagName = "gl-stack";
  static get observedAttributes() {
    return ["direction", "align", "justify", "gap", "wrap", "variant", "columns", "responsive"];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }
}

