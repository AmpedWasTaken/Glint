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
      background: var(--gl-panel);
      border-radius: var(--gl-radius);
      padding: var(--gl-space-4);
      box-sizing: border-box;
    }
    .chart-svg {
      width: 100%;
      height: 100%;
    }
    .chart-grid-line {
      stroke: var(--gl-border);
      stroke-width: 1;
      stroke-dasharray: 2, 2;
      opacity: 0.5;
    }
    .chart-axis-line {
      stroke: var(--gl-border);
      stroke-width: 1;
    }
    .chart-axis-label {
      fill: var(--gl-muted);
      font-size: 11px;
      font-family: inherit;
    }
    .chart-bar {
      fill: url(#barGradient);
      transition: all var(--gl-dur-1) var(--gl-ease);
      cursor: pointer;
      rx: 4;
      ry: 4;
    }
    .chart-bar:hover {
      opacity: 0.9;
      filter: brightness(1.1);
    }
    .chart-line {
      fill: none;
      stroke: url(#lineGradient);
      stroke-width: 3;
      transition: all var(--gl-dur-1) var(--gl-ease);
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .chart-area {
      fill: url(#areaGradient);
      opacity: 0.4;
      transition: all var(--gl-dur-1) var(--gl-ease);
    }
    .chart-point {
      fill: var(--gl-panel);
      stroke: var(--gl-primary);
      stroke-width: 3;
      transition: all var(--gl-dur-1) var(--gl-ease);
      cursor: pointer;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
    .chart-point:hover {
      r: 6;
      stroke-width: 4;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }
    .chart-pie-segment {
      transition: all var(--gl-dur-1) var(--gl-ease);
      cursor: pointer;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
    .chart-pie-segment:hover {
      transform: scale(1.05);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
      transform-origin: center;
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
      padding: var(--gl-space-1) var(--gl-space-2);
      border-radius: var(--gl-radius-sm);
      transition: background var(--gl-dur-1) var(--gl-ease);
      cursor: pointer;
    }
    .chart-legend-item:hover {
      background: var(--gl-hover);
    }
    .chart-legend-color {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .chart-value-label {
      fill: var(--gl-fg);
      font-size: 11px;
      font-weight: 600;
      font-family: inherit;
      text-anchor: middle;
      pointer-events: none;
    }
    .chart-y-axis-label {
      fill: var(--gl-muted);
      font-size: 10px;
      font-family: inherit;
      text-anchor: end;
    }
    .chart-tooltip {
      position: absolute;
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius-sm);
      padding: var(--gl-space-2) var(--gl-space-3);
      font-size: var(--gl-text-sm);
      pointer-events: none;
      opacity: 0;
      transition: opacity var(--gl-dur-1) var(--gl-ease);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transform: translate(-50%, -100%);
      margin-top: -8px;
    }
    .chart-tooltip.visible {
      opacity: 1;
    }
    .chart-tooltip-label {
      font-weight: 600;
      margin-bottom: var(--gl-space-1);
      color: var(--gl-fg);
    }
    .chart-tooltip-value {
      color: var(--gl-muted);
    }
    @keyframes barGrow {
      from {
        transform: scaleY(0);
        transform-origin: bottom;
      }
      to {
        transform: scaleY(1);
        transform-origin: bottom;
      }
    }
    .chart-bar {
      animation: barGrow 0.6s var(--gl-ease) backwards;
    }
    .chart-bar:nth-child(1) { animation-delay: 0.05s; }
    .chart-bar:nth-child(2) { animation-delay: 0.1s; }
    .chart-bar:nth-child(3) { animation-delay: 0.15s; }
    .chart-bar:nth-child(4) { animation-delay: 0.2s; }
    .chart-bar:nth-child(5) { animation-delay: 0.25s; }
    .chart-bar:nth-child(6) { animation-delay: 0.3s; }
    .chart-bar:nth-child(7) { animation-delay: 0.35s; }
    .chart-bar:nth-child(8) { animation-delay: 0.4s; }
    .chart-bar:nth-child(9) { animation-delay: 0.45s; }
    .chart-bar:nth-child(10) { animation-delay: 0.5s; }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .chart-line {
      animation: fadeIn 0.8s var(--gl-ease);
    }
    .chart-point {
      animation: fadeIn 0.8s var(--gl-ease);
    }
    .chart-pie-segment {
      animation: fadeIn 0.6s var(--gl-ease) backwards;
    }
  </style>
  <div class="chart" part="chart">
    <svg class="chart-svg" part="svg"></svg>
    <div class="chart-tooltip" part="tooltip">
      <div class="chart-tooltip-label"></div>
      <div class="chart-tooltip-value"></div>
    </div>
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
  #tooltip!: HTMLElement;
  #type = "bar";
  #data: any[] = [];
  #width = 400;
  #height = 300;
  #padding = { top: 30, right: 30, bottom: 50, left: 50 };

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#svg = this.shadowRoot!.querySelector(".chart-svg") as SVGSVGElement;
    this.#legend = this.shadowRoot!.querySelector(".chart-legend") as HTMLElement;
    this.#tooltip = this.shadowRoot!.querySelector(".chart-tooltip") as HTMLElement;

    // Hide tooltip on mouse leave
    this.#svg.addEventListener("mouseleave", () => {
      this.#hideTooltip();
    });

    this.update();
  }

  #showTooltip(x: number, y: number, label: string, value: string | number, color?: string) {
    if (!this.#tooltip) return;
    
    const tooltipLabel = this.#tooltip.querySelector(".chart-tooltip-label");
    const tooltipValue = this.#tooltip.querySelector(".chart-tooltip-value");
    
    if (tooltipLabel) tooltipLabel.textContent = label;
    if (tooltipValue) tooltipValue.textContent = String(value);
    
    if (color) {
      const colorIndicator = this.#tooltip.querySelector(".chart-tooltip-color") as HTMLElement;
      if (colorIndicator) {
        colorIndicator.style.backgroundColor = color;
      }
    }
    
    this.#tooltip.style.left = `${x}px`;
    this.#tooltip.style.top = `${y}px`;
    this.#tooltip.classList.add("visible");
  }

  #hideTooltip() {
    if (this.#tooltip) {
      this.#tooltip.classList.remove("visible");
    }
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

    // Add gradient definitions
    this.#addGradients();

    // Add grid lines
    this.#renderGrid();

    if (this.#type === "bar") {
      this.#renderBar();
    } else if (this.#type === "line") {
      this.#renderLine();
    } else if (this.#type === "pie") {
      this.#renderPie();
    }

    this.#renderLegend();
  }

  #addGradients() {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // Clip path for chart area
    const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    clipPath.setAttribute("id", "chartClip");
    const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    clipRect.setAttribute("x", String(this.#padding.left));
    clipRect.setAttribute("y", String(this.#padding.top));
    clipRect.setAttribute("width", String(this.#width - this.#padding.left - this.#padding.right));
    clipRect.setAttribute("height", String(this.#height - this.#padding.top - this.#padding.bottom));
    clipPath.appendChild(clipRect);
    defs.appendChild(clipPath);
    
    // Bar gradient
    const barGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    barGradient.setAttribute("id", "barGradient");
    barGradient.setAttribute("x1", "0%");
    barGradient.setAttribute("y1", "0%");
    barGradient.setAttribute("x2", "0%");
    barGradient.setAttribute("y2", "100%");
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "var(--gl-primary)");
    stop1.setAttribute("stop-opacity", "1");
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "var(--gl-primary)");
    stop2.setAttribute("stop-opacity", "0.7");
    barGradient.appendChild(stop1);
    barGradient.appendChild(stop2);
    defs.appendChild(barGradient);

    // Line gradient
    const lineGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    lineGradient.setAttribute("id", "lineGradient");
    lineGradient.setAttribute("x1", "0%");
    lineGradient.setAttribute("y1", "0%");
    lineGradient.setAttribute("x2", "100%");
    lineGradient.setAttribute("y2", "0%");
    const lineStop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    lineStop1.setAttribute("offset", "0%");
    lineStop1.setAttribute("stop-color", "var(--gl-primary)");
    const lineStop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    lineStop2.setAttribute("offset", "100%");
    lineStop2.setAttribute("stop-color", "var(--gl-primary)");
    lineStop2.setAttribute("stop-opacity", "0.6");
    lineGradient.appendChild(lineStop1);
    lineGradient.appendChild(lineStop2);
    defs.appendChild(lineGradient);

    // Area gradient
    const areaGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    areaGradient.setAttribute("id", "areaGradient");
    areaGradient.setAttribute("x1", "0%");
    areaGradient.setAttribute("y1", "0%");
    areaGradient.setAttribute("x2", "0%");
    areaGradient.setAttribute("y2", "100%");
    const areaStop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    areaStop1.setAttribute("offset", "0%");
    areaStop1.setAttribute("stop-color", "var(--gl-primary)");
    areaStop1.setAttribute("stop-opacity", "0.4");
    const areaStop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    areaStop2.setAttribute("offset", "100%");
    areaStop2.setAttribute("stop-color", "var(--gl-primary)");
    areaStop2.setAttribute("stop-opacity", "0.1");
    areaGradient.appendChild(areaStop1);
    areaGradient.appendChild(areaStop2);
    defs.appendChild(areaGradient);

    this.#svg.appendChild(defs);
  }

  #renderGrid() {
    if (this.#type === "pie") return;

    const chartWidth = this.#width - this.#padding.left - this.#padding.right;
    const chartHeight = this.#height - this.#padding.top - this.#padding.bottom;
    const gridLines = 5;
    const maxValue = Math.max(...this.#data.map((d) => d.value || d));

    // Horizontal grid lines with Y-axis labels
    for (let i = 0; i <= gridLines; i++) {
      const y = this.#padding.top + (i * chartHeight / gridLines);
      const value = maxValue - (i * maxValue / gridLines);
      
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "chart-grid-line");
      line.setAttribute("x1", String(this.#padding.left));
      line.setAttribute("y1", String(y));
      line.setAttribute("x2", String(this.#width - this.#padding.right));
      line.setAttribute("y2", String(y));
      this.#svg.appendChild(line);

      // Y-axis label
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "chart-y-axis-label");
      label.setAttribute("x", String(this.#padding.left - 8));
      label.setAttribute("y", String(y + 4));
      label.textContent = this.#formatValue(value);
      this.#svg.appendChild(label);
    }

    // Vertical axis line
    const axisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axisLine.setAttribute("class", "chart-axis-line");
    axisLine.setAttribute("x1", String(this.#padding.left));
    axisLine.setAttribute("y1", String(this.#padding.top));
    axisLine.setAttribute("x2", String(this.#padding.left));
    axisLine.setAttribute("y2", String(this.#height - this.#padding.bottom));
    this.#svg.appendChild(axisLine);

    // Bottom axis line
    const bottomAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    bottomAxis.setAttribute("class", "chart-axis-line");
    bottomAxis.setAttribute("x1", String(this.#padding.left));
    bottomAxis.setAttribute("y1", String(this.#height - this.#padding.bottom));
    bottomAxis.setAttribute("x2", String(this.#width - this.#padding.right));
    bottomAxis.setAttribute("y2", String(this.#height - this.#padding.bottom));
    this.#svg.appendChild(bottomAxis);
  }

  #formatValue(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toString();
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

      // Create gradient for this bar if custom color
      const color = item.color || "var(--gl-primary)";
      let fillColor = "url(#barGradient)";
      if (item.color) {
        const gradientId = `barGradient-${index}`;
        this.#createCustomGradient(gradientId, color);
        fillColor = `url(#${gradientId})`;
      }

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("class", "chart-bar");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(barWidth));
      rect.setAttribute("height", String(barHeight));
      rect.setAttribute("fill", fillColor);
      rect.setAttribute("rx", "4");
      rect.setAttribute("ry", "4");
      
      // Tooltip events
      rect.addEventListener("mouseenter", (e: MouseEvent) => {
        const chartRect = this.shadowRoot!.querySelector(".chart")!.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        const mouseY = e.clientY - chartRect.top;
        this.#showTooltip(mouseX, mouseY, label, value, color);
      });
      rect.addEventListener("mouseleave", () => this.#hideTooltip());
      rect.addEventListener("mousemove", (e: MouseEvent) => {
        const chartRect = this.shadowRoot!.querySelector(".chart")!.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        const mouseY = e.clientY - chartRect.top;
        this.#showTooltip(mouseX, mouseY, label, value, color);
      });
      
      this.#svg.appendChild(rect);

      // Value label on top of bar
      if (barHeight > 20) {
        const valueText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        valueText.setAttribute("class", "chart-value-label");
        valueText.setAttribute("x", String(x + barWidth / 2));
        valueText.setAttribute("y", String(y - 5));
        valueText.textContent = String(value);
        this.#svg.appendChild(valueText);
      }

      // Label
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("class", "chart-axis-label");
      text.setAttribute("x", String(x + barWidth / 2));
      text.setAttribute("y", String(this.#height - this.#padding.bottom + 15));
      text.setAttribute("text-anchor", "middle");
      text.textContent = label;
      this.#svg.appendChild(text);
    });
  }

  #createCustomGradient(id: string, color: string) {
    const defs = this.#svg.querySelector("defs");
    if (!defs) return;

    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", id);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");
    
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", color);
    stop1.setAttribute("stop-opacity", "1");
    
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", color);
    stop2.setAttribute("stop-opacity", "0.7");
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
  }

  #renderLine() {
    const data = this.#data;
    const chartWidth = this.#width - this.#padding.left - this.#padding.right;
    const chartHeight = this.#height - this.#padding.top - this.#padding.bottom;
    const maxValue = Math.max(...data.map((d) => d.value || d));
    const points: { x: number; y: number; value: number; label: string }[] = [];
    const areaPoints: string[] = [];

    data.forEach((item, index) => {
      const value = item.value || item;
      const label = item.label || `Point ${index + 1}`;
      const x = this.#padding.left + (index * chartWidth / (data.length - 1 || 1));
      const y = this.#padding.top + chartHeight - (value / maxValue) * chartHeight;
      points.push({ x, y, value, label });
    });

    // Build area points - start from bottom left, go through all points, end at bottom right
    const firstX = points[0]?.x || this.#padding.left;
    const lastX = points[points.length - 1]?.x || (this.#width - this.#padding.right);
    const bottomY = this.#height - this.#padding.bottom;
    
    areaPoints.push(`${firstX},${bottomY}`);
    points.forEach(p => {
      areaPoints.push(`${p.x},${p.y}`);
    });
    areaPoints.push(`${lastX},${bottomY}`);

    const color = data[0]?.color || "var(--gl-primary)";
    
    // Area fill with smooth curve
    const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    areaPath.setAttribute("class", "chart-area");
    areaPath.setAttribute("d", this.#createSmoothPath(areaPoints, true));
    areaPath.setAttribute("clip-path", "url(#chartClip)");
    if (data[0]?.color) {
      this.#createAreaGradient("areaGradientCustom", color);
      areaPath.setAttribute("fill", "url(#areaGradientCustom)");
    } else {
      areaPath.setAttribute("fill", "url(#areaGradient)");
    }
    this.#svg.appendChild(areaPath);

    // Line with smooth curve
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "chart-line");
    const linePoints = points.map(p => `${p.x},${p.y}`);
    path.setAttribute("d", this.#createSmoothPath(linePoints, false));
    path.setAttribute("clip-path", "url(#chartClip)");
    if (data[0]?.color) {
      this.#createLineGradient("lineGradientCustom", color);
      path.setAttribute("stroke", "url(#lineGradientCustom)");
    } else {
      path.setAttribute("stroke", "url(#lineGradient)");
    }
    this.#svg.appendChild(path);

    // Points with tooltips
    points.forEach((point, index) => {
      const item = data[index];
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("class", "chart-point");
      circle.setAttribute("cx", String(point.x));
      circle.setAttribute("cy", String(point.y));
      circle.setAttribute("r", "4");
      circle.setAttribute("stroke", item?.color || color);
      
      // Tooltip events
      circle.addEventListener("mouseenter", (e: MouseEvent) => {
        const chartRect = this.shadowRoot!.querySelector(".chart")!.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        const mouseY = e.clientY - chartRect.top;
        this.#showTooltip(mouseX, mouseY, point.label, point.value, item?.color || color);
      });
      circle.addEventListener("mouseleave", () => this.#hideTooltip());
      circle.addEventListener("mousemove", (e: MouseEvent) => {
        const chartRect = this.shadowRoot!.querySelector(".chart")!.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        const mouseY = e.clientY - chartRect.top;
        this.#showTooltip(mouseX, mouseY, point.label, point.value, item?.color || color);
      });
      
      this.#svg.appendChild(circle);
    });
  }

  #createSmoothPath(points: string[], closed: boolean): string {
    if (points.length < 2) return "";
    
    const parsedPoints = points.map(p => {
      const parts = p.split(",");
      const x = Number(parts[0]) || 0;
      const y = Number(parts[1]) || 0;
      return { x, y };
    });

    if (parsedPoints.length === 0) return "";
    
    const first = parsedPoints[0];
    if (!first) return "";
    
    let path = `M ${first.x},${first.y}`;
    
    for (let i = 0; i < parsedPoints.length - 1; i++) {
      const p0 = parsedPoints[Math.max(0, i - 1)];
      const p1 = parsedPoints[i];
      const p2 = parsedPoints[i + 1];
      const p3 = parsedPoints[Math.min(parsedPoints.length - 1, i + 2)];
      
      if (!p0 || !p1 || !p2 || !p3) continue;
      
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    
    if (closed) {
      path += " Z";
    }
    
    return path;
  }

  #createLineGradient(id: string, color: string) {
    const defs = this.#svg.querySelector("defs");
    if (!defs) return;

    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", id);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "0%");
    
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", color);
    
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", color);
    stop2.setAttribute("stop-opacity", "0.6");
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
  }

  #createAreaGradient(id: string, color: string) {
    const defs = this.#svg.querySelector("defs");
    if (!defs) return;

    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", id);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");
    
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", color);
    stop1.setAttribute("stop-opacity", "0.4");
    
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", color);
    stop2.setAttribute("stop-opacity", "0.1");
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
  }

  #renderPie() {
    const data = this.#data;
    const centerX = this.#width / 2;
    const centerY = this.#height / 2;
    const radius = Math.min(this.#width, this.#height) / 2 - 40;
    let currentAngle = -Math.PI / 2;
    const total = data.reduce((sum, item) => sum + (item.value || item), 0);

    // Default colors if not provided
    const defaultColors = [
      "var(--gl-primary)",
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899"
    ];

    data.forEach((item, index) => {
      const value = item.value || item;
      const angle = (value / total) * 2 * Math.PI;
      const endAngle = currentAngle + angle;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;

      const segmentColor = item.color || defaultColors[index % defaultColors.length];
      const label = item.label || `Segment ${index + 1}`;
      const percentage = Math.round((value / total) * 100);
      
      path.setAttribute("d", `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`);
      path.setAttribute("fill", segmentColor);
      path.setAttribute("class", "chart-pie-segment");
      
      // Tooltip events
      path.addEventListener("mouseenter", (e: MouseEvent) => {
        const chartRect = this.shadowRoot!.querySelector(".chart")!.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        const mouseY = e.clientY - chartRect.top;
        this.#showTooltip(mouseX, mouseY, label, `${value} (${percentage}%)`, segmentColor);
      });
      path.addEventListener("mouseleave", () => this.#hideTooltip());
      path.addEventListener("mousemove", (e: MouseEvent) => {
        const chartRect = this.shadowRoot!.querySelector(".chart")!.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        const mouseY = e.clientY - chartRect.top;
        this.#showTooltip(mouseX, mouseY, label, `${value} (${percentage}%)`, segmentColor);
      });
      
      this.#svg.appendChild(path);

      // Label in center of segment
      const midAngle = currentAngle + angle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);
      
      if (angle > 0.2) { // Only show label if segment is large enough
        const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textLabel.setAttribute("class", "chart-value-label");
        textLabel.setAttribute("x", String(labelX));
        textLabel.setAttribute("y", String(labelY));
        textLabel.setAttribute("text-anchor", "middle");
        textLabel.setAttribute("dominant-baseline", "middle");
        textLabel.textContent = `${percentage}%`;
        this.#svg.appendChild(textLabel);
      }

      currentAngle = endAngle;
    });
  }

  #renderLegend() {
    this.#legend.innerHTML = "";
    const defaultColors = [
      "var(--gl-primary)",
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899"
    ];

    this.#data.forEach((item, index) => {
      const legendItem = document.createElement("div");
      legendItem.className = "chart-legend-item";
      
      const color = document.createElement("div");
      color.className = "chart-legend-color";
      const itemColor = item.color || defaultColors[index % defaultColors.length];
      color.style.backgroundColor = itemColor;
      
      const label = document.createElement("span");
      label.textContent = item.label || `Series ${index + 1}`;
      
      legendItem.appendChild(color);
      legendItem.appendChild(label);
      this.#legend.appendChild(legendItem);
    });
  }
}

