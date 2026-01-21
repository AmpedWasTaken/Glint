import { emit } from "../../internal/events.js";

export class GlCodeblock extends HTMLElement {
  static tagName = "gl-codeblock";

  #pre?: HTMLPreElement;
  #code?: HTMLElement;
  #copyBtn?: HTMLButtonElement;
  #codeContent = "";

  constructor() {
    super();
    // Extract content immediately in constructor, before shadow DOM
    this.#extractContent();
  }

  #decodeHTMLEntities(text: string): string {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }

  #extractContent(): void {
    if (this.#codeContent) return;

    // Method 1: Check for data-code attribute (supports multiline)
    if (this.hasAttribute("data-code")) {
      this.#codeContent = this.getAttribute("data-code") || "";
      return;
    }

    // Method 2: Read innerHTML before shadow DOM is attached
    // Clone the element to preserve its state
    const clone = this.cloneNode(true) as HTMLElement;
    
    // Remove any template tags and shadow root templates (they're just markers)
    const templates = clone.querySelectorAll("template");
    templates.forEach((tpl) => {
      // Skip shadow root templates
      if (!tpl.hasAttribute("shadowrootmode")) {
        // Extract content from template and replace it
        if (tpl.content && tpl.content.childNodes.length > 0) {
          const div = document.createElement("div");
          div.appendChild(tpl.content.cloneNode(true));
          const parent = tpl.parentNode;
          if (parent) {
            const textNode = document.createTextNode(div.innerHTML);
            parent.replaceChild(textNode, tpl);
          }
        } else {
          tpl.remove();
        }
      } else {
        tpl.remove();
      }
    });
    
    // Get the innerHTML of what's left (supports multiline)
    const innerHTML = clone.innerHTML.trim();
    if (innerHTML) {
      // Decode HTML entities (e.g., &quot; -> ")
      this.#codeContent = this.#decodeHTMLEntities(innerHTML);
      return;
    }

    // Method 3: Fallback to textContent (supports multiline)
    this.#codeContent = this.textContent?.trim() || "";
  }

  connectedCallback(): void {
    if (this.shadowRoot) return;

    const lang = this.getAttribute("lang") || "text";
    const showCopy = this.hasAttribute("copy");

    // Ensure content is extracted
    if (!this.#codeContent) {
      this.#extractContent();
    }

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

    this.#highlight(this.#codeContent, lang);
  }

  #highlight(code: string, lang: string): void {
    if (!this.#code) return;

    if (lang === "html" || lang === "xml") {
      this.#code.innerHTML = this.#highlightHTML(code);
    } else if (lang === "css") {
      this.#code.innerHTML = this.#highlightCSS(code);
    } else if (lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript" || lang === "jsx" || lang === "tsx") {
      if (lang === "jsx" || lang === "tsx") {
        this.#code.innerHTML = this.#highlightJSX(code);
      } else {
        this.#code.innerHTML = this.#highlightJS(code);
      }
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
    // First escape HTML entities
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Comments (must be first to avoid breaking other patterns)
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    
    // Strings (before other patterns to avoid breaking them)
    highlighted = highlighted.replace(/(["'][^"']*["'])/g, '<span class="string">$1</span>');
    
    // Numbers
    highlighted = highlighted.replace(/(\d+\.?\d*)/g, '<span class="number">$1</span>');
    
    // Selectors (before properties to avoid conflicts)
    highlighted = highlighted.replace(/([\w-.#:\[\]()]+)(\s*)(\{)/g, '<span class="selector">$1</span>$2<span class="punctuation">$3</span>');
    
    // Properties and values
    highlighted = highlighted.replace(/([\w-]+)(\s*)(:)(\s*)([^;{}]+)(;)/g, '<span class="property">$1</span>$2<span class="operator">$3</span>$4<span class="attr-value">$5</span><span class="punctuation">$6</span>');
    
    // Closing braces
    highlighted = highlighted.replace(/(\})/g, '<span class="punctuation">$1</span>');
    
    return highlighted;
  }

  #highlightJS(code: string): string {
    const keywords = /\b(const|let|var|function|if|else|for|while|return|class|extends|import|export|from|default|async|await|try|catch|throw|new|this|super|static|public|private|protected|interface|type|enum|namespace|declare|as|of|in|typeof|instanceof|true|false|null|undefined|void)\b/g;
    const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    const numbers = /\b\d+\.?\d*\b/g;
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;

    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(comments, '<span class="comment">$1</span>')
      .replace(strings, '<span class="string">$&</span>')
      .replace(numbers, '<span class="number">$&</span>')
      .replace(keywords, '<span class="keyword">$&</span>')
      .replace(functions, '<span class="function">$1</span> ');
  }

  #highlightJSX(code: string): string {
    // First escape HTML entities
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Comments (must be first)
    highlighted = highlighted.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>');
    
    // JSX tags - handle both opening and closing tags
    // Match: &lt;tag&gt; or &lt;/tag&gt; or &lt;tag attr="value"&gt;
    highlighted = highlighted.replace(/&lt;(\/?)([\w-]+)([^&]*?)&gt;/g, (match, close, tag, attrs) => {
      // Highlight attributes
      const attrsHighlighted = attrs.replace(
        /(\w+)(=)(["'][^"']*["']|\{[^}]*\})/g,
        '<span class="attr-name">$1</span><span class="operator">$2</span><span class="attr-value">$3</span>'
      );
      return `<span class="tag">&lt;${close}${tag}</span>${attrsHighlighted}<span class="tag">&gt;</span>`;
    });
    
    // Strings (after JSX tags to avoid breaking them, but before other patterns)
    highlighted = highlighted.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
    
    // Numbers
    highlighted = highlighted.replace(/\b\d+\.?\d*\b/g, '<span class="number">$&</span>');
    
    // Keywords
    const keywords = /\b(const|let|var|function|if|else|for|while|return|class|extends|import|export|from|default|async|await|try|catch|throw|new|this|super|static|public|private|protected|interface|type|enum|namespace|declare|as|of|in|typeof|instanceof|true|false|null|undefined|void)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="keyword">$&</span>');
    
    // Functions (simple approach - JSX tags already handled)
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="function">$1</span> ');
    
    return highlighted;
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
