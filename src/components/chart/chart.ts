import { emit } from "../../internal/events.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .chart {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 300px;
    }
    .chart-svg {
      width: 100%;
      height: 100%;
    }
    .chart-bar {
      fill: var(--gl-primary);
      transition: all var(--gl-dur-1) var(--gl-ease);
      cursor: pointer;
    }
    .chart-bar:hover {
      opacity: 0.8;
      transform: scaleY(1.05);
    }
    .chart-line {
      fill: none;
      stroke: var(--gl-primary);
      stroke-width: 2;
      transition: all var(--gl-dur-1) var(--gl-ease);
    }
    .chart-area {
      fill: var(--gl-primary);
      opacity: 0.2;
      transition: all var(--gl-dur-1) var(--gl-ease);
    }
    .chart-point {
      fill: var(--gl-primary);
      transition: all var(--gl-dur-1) var(--gl-ease);
      cursor: pointer;
    }
    .chart-point:hover {
      r: 6;
    }
    .chart-legend {
      display: flex;
      gap: var(--gl-space-4);
      margin-top: var(--gl-space-4);
      flex-wrap: wrap;
      justify-content: center;
    }
    .chart-legend-item {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
      font-size: var(--gl-text-sm);
    }
    .chart-legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
  </style>
  <div class="chart" part="chart">
    <svg class="chart-svg" part="svg"></svg>
    <div class="chart-legend" part="legend"></div>
  </div>
`;

export class GlChart extends HTMLElement {
  static tagName = "gl-chart";
  static get observedAttributes() {
    return ["type", "data", "width", "height"];
  }

  #svg!: SVGSVGElement;
  #legend!: HTMLElement;
  #type = "bar";
  #data: any[] = [];
  #width = 400;
  #height = 300;
  #padding = { top: 20, right: 20, bottom: 40, left: 40 };

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#svg = this.shadowRoot!.querySelector(".chart-svg") as SVGSVGElement;
    this.#legend = this.shadowRoot!.querySelector(".chart-legend") as HTMLElement;

    this.update();
  }

  attributeChangedCallback(name: string) {
    if (name === "type") {
      this.#type = this.getAttribute("type") || "bar";
      this.update();
    } else if (name === "data") {
      const dataAttr = this.getAttribute("data");
      if (dataAttr) {
        try {
          this.#data = JSON.parse(dataAttr);
          this.update();
        } catch (e) {
          console.error("Invalid chart data", e);
        }
      }
    } else if (name === "width") {
      this.#width = Number(this.getAttribute("width")) || 400;
      this.update();
    } else if (name === "height") {
      this.#height = Number(this.getAttribute("height")) || 300;
      this.update();
    }
  }

  update() {
    if (this.#data.length === 0) return;

    this.#svg.setAttribute("viewBox", `0 0 ${this.#width} ${this.#height}`);
    this.#svg.innerHTML = "";

    if (this.#type === "bar") {
      this.#renderBar();
    } else if (this.#type === "line") {
      this.#renderLine();
    } else if (this.#type === "pie") {
      this.#renderPie();
    }

    this.#renderLegend();
  }

  #renderBar() {
    const data = this.#data;
    const chartWidth = this.#width - this.#padding.left - this.#padding.right;
    const chartHeight = this.#height - this.#padding.top - this.#padding.bottom;
    const barWidth = chartWidth / data.length * 0.6;
    const maxValue = Math.max(...data.map((d) => d.value || d));

    data.forEach((item, index) => {
      const value = item.value || item;
      const label = item.label || `Item ${index + 1}`;
      const x = this.#padding.left + (index * chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
      const barHeight = (value / maxValue) * chartHeight;
      const y = this.#padding.top + chartHeight - barHeight;

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("class", "chart-bar");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(barWidth));
      rect.setAttribute("height", String(barHeight));
      rect.setAttribute("fill", item.color || "var(--gl-primary)");
      this.#svg.appendChild(rect);

      // Label
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(x + barWidth / 2));
      text.setAttribute("y", String(this.#height - this.#padding.bottom + 15));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", "var(--gl-muted)");
      text.textContent = label;
      this.#svg.appendChild(text);
    });
  }

  #renderLine() {
    const data = this.#data;
    const chartWidth = this.#width - this.#padding.left - this.#padding.right;
    const chartHeight = this.#height - this.#padding.top - this.#padding.bottom;
    const maxValue = Math.max(...data.map((d) => d.value || d));
    const points: string[] = [];

    data.forEach((item, index) => {
      const value = item.value || item;
      const x = this.#padding.left + (index * chartWidth / (data.length - 1));
      const y = this.#padding.top + chartHeight - (value / maxValue) * chartHeight;
      points.push(`${x},${y}`);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("class", "chart-point");
      circle.setAttribute("cx", String(x));
      circle.setAttribute("cy", String(y));
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", item.color || "var(--gl-primary)");
      this.#svg.appendChild(circle);
    });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "chart-line");
    path.setAttribute("d", `M ${points.join(" L ")}`);
    path.setAttribute("stroke", data[0]?.color || "var(--gl-primary)");
    this.#svg.insertBefore(path, this.#svg.firstChild);
  }

  #renderPie() {
    const data = this.#data;
    const centerX = this.#width / 2;
    const centerY = this.#height / 2;
    const radius = Math.min(this.#width, this.#height) / 2 - 20;
    let currentAngle = -Math.PI / 2;
    const total = data.reduce((sum, item) => sum + (item.value || item), 0);

    data.forEach((item) => {
      const value = item.value || item;
      const angle = (value / total) * 2 * Math.PI;
      const endAngle = currentAngle + angle;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;

      path.setAttribute("d", `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`);
      path.setAttribute("fill", item.color || "var(--gl-primary)");
      path.setAttribute("class", "chart-bar");
      this.#svg.appendChild(path);

      currentAngle = endAngle;
    });
  }

  #renderLegend() {
    this.#legend.innerHTML = "";
    this.#data.forEach((item, index) => {
      const legendItem = document.createElement("div");
      legendItem.className = "chart-legend-item";
      
      const color = document.createElement("div");
      color.className = "chart-legend-color";
      color.style.backgroundColor = item.color || "var(--gl-primary)";
      
      const label = document.createElement("span");
      label.textContent = item.label || `Series ${index + 1}`;
      
      legendItem.appendChild(color);
      legendItem.appendChild(label);
      this.#legend.appendChild(legendItem);
    });
  }
}

