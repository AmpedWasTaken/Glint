import { emit } from "../../internal/events.js";

export class GlCodeblock extends HTMLElement {
  static tagName = "gl-codeblock";

  #pre?: HTMLPreElement;
  #code?: HTMLElement;
  #copyBtn?: HTMLButtonElement;
  #codeContent = "";

  constructor() {
    super();
  }

  #extractContent(): void {
    // Don't return early if content is empty string - we need to try again
    if (this.#codeContent && this.#codeContent.trim().length > 0) return;

    // Method 1: Check for data-code attribute (supports multiline)
    if (this.hasAttribute("data-code")) {
      this.#codeContent = this.getAttribute("data-code") || "";
      return;
    }

    // Method 2: Read innerHTML directly before shadow DOM is attached
    // This is the most reliable - innerHTML contains the raw HTML string
    let innerHTML = this.innerHTML.trim();
    
    // Remove shadow root templates if present
    if (innerHTML.includes("shadowrootmode")) {
      innerHTML = innerHTML.replace(/<template[^>]*shadowrootmode[^>]*>[\s\S]*?<\/template>/gi, "").trim();
    }
    
    // Remove regular template tags but extract their content
    if (innerHTML.includes("<template")) {
      // Replace template tags with their content
      innerHTML = innerHTML.replace(/<template[^>]*>([\s\S]*?)<\/template>/gi, (match, content) => {
        return content.trim();
      }).trim();
    }
    
    if (innerHTML) {
      this.#codeContent = innerHTML;
      return;
    }

    // Method 3: Fallback - read from childNodes and serialize
    const contentParts: string[] = [];
    
    for (const child of Array.from(this.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) contentParts.push(text);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        // Skip shadow root templates
        if (el.tagName === "TEMPLATE" && el.hasAttribute("shadowrootmode")) {
          continue;
        }
        // Extract content from regular template tags
        if (el.tagName === "TEMPLATE") {
          const templateEl = el as HTMLTemplateElement;
          if (templateEl.content && templateEl.content.childNodes.length > 0) {
            const div = document.createElement("div");
            div.appendChild(templateEl.content.cloneNode(true));
            const serialized = div.innerHTML.trim();
            if (serialized) {
              contentParts.push(serialized);
              continue;
            }
          }
          // Fallback: try textContent of template
          const textContent = templateEl.textContent?.trim();
          if (textContent) {
            contentParts.push(textContent);
            continue;
          }
        } else {
          // Regular element - use outerHTML to preserve structure
          contentParts.push(el.outerHTML);
        }
      }
    }

    if (contentParts.length > 0) {
      this.#codeContent = contentParts.join("\n").trim();
      return;
    }

    // Method 4: Last resort - textContent
    this.#codeContent = this.textContent?.trim() || "";
  }

  connectedCallback(): void {
    if (this.shadowRoot) return;

    // Extract content BEFORE attaching shadow DOM
    this.#extractContent();
    
    // Debug logging
    console.log("[GlCodeblock] connectedCallback", {
      id: this.id || "no-id",
      innerHTML: this.innerHTML.substring(0, 100),
      textContent: this.textContent?.substring(0, 100),
      childNodes: this.childNodes.length,
      extractedContent: this.#codeContent.substring(0, 100),
      extractedLength: this.#codeContent.length
    });

    const lang = this.getAttribute("lang") || "text";
    const showCopy = this.hasAttribute("copy");

    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
        }
        .container {
          position: relative;
          background: var(--gl-panel);
          border: 1px solid var(--gl-border);
          border-radius: var(--gl-radius);
          overflow: hidden;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid var(--gl-border);
          background: var(--gl-bg);
          font-size: 12px;
          color: var(--gl-muted);
        }
        .lang {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .copyBtn {
          all: unset;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          color: var(--gl-fg);
          transition: background var(--gl-dur-1) var(--gl-ease);
        }
        .copyBtn:hover {
          background: var(--gl-hover);
        }
        .copyBtn.copied {
          color: var(--gl-success);
        }
        pre {
          margin: 0;
          padding: 16px;
          overflow-x: auto;
          font-family: "Consolas", "Monaco", "Courier New", monospace;
          font-size: 13px;
          line-height: 1.6;
          color: var(--gl-fg);
          background: var(--gl-panel);
        }
        code {
          font-family: inherit;
          display: block;
        }
        :host([motion="subtle"]) pre {
          transition: opacity var(--gl-dur-2) var(--gl-ease-out);
        }
        :host([motion="snappy"]) pre {
          transition: opacity var(--gl-dur-1) var(--gl-ease-out);
        }
        :host([motion="bounce"]) pre {
          transition: opacity var(--gl-dur-1) var(--gl-ease-bounce);
        }
        .keyword { color: var(--gl-code-keyword, #c792ea); }
        .string { color: var(--gl-code-string, #c3e88d); }
        .number { color: var(--gl-code-number, #f78c6c); }
        .function { color: var(--gl-code-function, #82aaff); }
        .comment { color: var(--gl-code-comment, #546e7a); opacity: 0.7; }
        .operator { color: var(--gl-code-operator, #89ddff); }
        .punctuation { color: var(--gl-code-punctuation, #eeffff); }
        .tag { color: var(--gl-code-tag, #f07178); }
        .attr-name { color: var(--gl-code-attr-name, #c792ea); }
        .attr-value { color: var(--gl-code-attr-value, #c3e88d); }
        .property { color: var(--gl-code-property, #82aaff); }
        .selector { color: var(--gl-code-selector, #c792ea); }
        .variable { color: var(--gl-code-variable, #f07178); }
        .constant { color: var(--gl-code-constant, #ffcb6b); }
        .regex { color: var(--gl-code-regex, #c3e88d); }
      </style>
      <div class="container">
        ${showCopy ? `<div class="header">
          <span class="lang">${lang}</span>
          <button class="copyBtn" part="copy-button" aria-label="Copy code">Copy</button>
        </div>` : ""}
        <pre part="pre"><code part="code"></code></pre>
      </div>
    `;

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this.#pre = shadow.querySelector("pre")!;
    this.#code = shadow.querySelector("code")!;
    if (showCopy) {
      this.#copyBtn = shadow.querySelector(".copyBtn")!;
      this.#copyBtn.addEventListener("click", () => this.#copy());
    }

    // Highlight and display the code
    this.#highlight(this.#codeContent, lang);
    
    // Debug: Check if code was set
    setTimeout(() => {
      if (this.#code) {
        console.log("[GlCodeblock] After highlight", {
          id: this.id || "no-id",
          codeInnerHTML: this.#code.innerHTML.substring(0, 100),
          codeInnerHTMLLength: this.#code.innerHTML.length,
          codeTextContent: this.#code.textContent?.substring(0, 100)
        });
      } else {
        console.warn("[GlCodeblock] Code element not found!", this.id || "no-id");
      }
    }, 100);
  }

  #highlight(code: string, lang: string): void {
    if (!this.#code) return;

    if (lang === "html" || lang === "xml") {
      this.#code.innerHTML = this.#highlightHTML(code);
    } else if (lang === "css") {
      this.#code.innerHTML = this.#highlightCSS(code);
    } else if (lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript") {
      this.#code.innerHTML = this.#highlightJS(code);
    } else if (lang === "json") {
      this.#code.innerHTML = this.#highlightJSON(code);
    } else {
      this.#code.textContent = code;
    }
  }

  #highlightHTML(code: string): string {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&lt;(\/?)([\w-]+)([^&]*?)&gt;/g, (_, close, tag, attrs) => {
        const attrsHighlighted = attrs.replace(
          /(\w+)(=)(["'][^"']*["'])/g,
          '<span class="attr-name">$1</span><span class="operator">$2</span><span class="attr-value">$3</span>'
        );
        return `<span class="tag">&lt;${close}${tag}</span>${attrsHighlighted}<span class="tag">&gt;</span>`;
      });
  }

  #highlightCSS(code: string): string {
    // Escape HTML first
    let result = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Use a simpler approach: process line by line to avoid regex conflicts
    const lines = result.split("\n");
    const highlightedLines = lines.map((line) => {
      // Skip if already has spans (shouldn't happen, but safety check)
      if (line.includes('<span')) return line;
      
      let highlighted = line;
      
      // Comments (multiline handled separately)
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
      
      // Strings
      highlighted = highlighted.replace(/(["'][^"']*["'])/g, '<span class="string">$1</span>');
      
      // Numbers (but not inside strings - simple check)
      if (!highlighted.includes('<span class="string">')) {
        highlighted = highlighted.replace(/(\d+\.?\d*)/g, '<span class="number">$1</span>');
      }
      
      // Selectors: word followed by {
      highlighted = highlighted.replace(/([\w-]+)(\s*)(\{)/g, '<span class="selector">$1</span>$2<span class="punctuation">$3</span>');
      
      // Properties: word followed by :
      highlighted = highlighted.replace(/([\w-]+)(\s*)(:)/g, '<span class="property">$1</span>$2<span class="operator">$3</span>');
      
      return highlighted;
    });
    
    return highlightedLines.join("\n");
  }

  #highlightJS(code: string): string {
    // Escape HTML first
    let result = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Process in order: comments, strings, numbers, keywords, functions
    // Use simpler regex patterns to avoid conflicts
    
    // Comments first
    result = result.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>');
    
    // Strings (simple pattern)
    result = result.replace(/(["'`][^"'`]*["'`])/g, '<span class="string">$1</span>');
    
    // Numbers
    result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
    
    // Keywords
    const keywordPattern = /\b(const|let|var|function|if|else|for|while|return|class|extends|import|export|from|default|async|await|try|catch|throw|new|this|super|static|public|private|protected|interface|type|enum|namespace|declare|as|of|in|typeof|instanceof|true|false|null|undefined|void)\b/g;
    result = result.replace(keywordPattern, '<span class="keyword">$1</span>');
    
    // Functions: identifier followed by (
    result = result.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="function">$1</span>');
    
    return result;
  }

  #highlightJSON(code: string): string {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(["'][^"']*["'])(\s*)(:)/g, '<span class="property">$1</span>$2<span class="operator">$3</span>')
      .replace(/(["'][^"']*["'])/g, '<span class="string">$1</span>')
      .replace(/(\d+\.?\d*)/g, '<span class="number">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="constant">$&</span>');
  }

  async #copy(): Promise<void> {
    if (!this.#copyBtn) return;
    try {
      await navigator.clipboard.writeText(this.#codeContent);
      this.#copyBtn.textContent = "Copied!";
      this.#copyBtn.classList.add("copied");
      emit(this, "gl-copy", { code: this.#codeContent });
      setTimeout(() => {
        if (this.#copyBtn) {
          this.#copyBtn.textContent = "Copy";
          this.#copyBtn.classList.remove("copied");
        }
      }, 2000);
    } catch (err) {
      this.#copyBtn.textContent = "Failed";
      setTimeout(() => {
        if (this.#copyBtn) {
          this.#copyBtn.textContent = "Copy";
        }
      }, 2000);
    }
  }
}
