import { emit } from "../../internal/events.js";

export class GlCodeblock extends HTMLElement {
  static tagName = "gl-codeblock";

  #pre?: HTMLPreElement;
  #code?: HTMLElement;
  #copyBtn?: HTMLButtonElement;
  #foldBtn?: HTMLButtonElement;
  #lineNumbers?: HTMLElement;
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
    const showLines = this.hasAttribute("line-numbers");
    const foldable = this.hasAttribute("foldable");

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
        .code-wrapper{
          display:flex;
          overflow-x:auto;
        }
        .line-numbers{
          display:none;
          padding:16px 8px 16px 16px;
          background:var(--gl-bg);
          border-right:1px solid var(--gl-border);
          font-family:"Consolas", "Monaco", "Courier New", monospace;
          font-size:13px;
          line-height:1.6;
          color:var(--gl-muted);
          user-select:none;
          text-align:right;
        }
        :host([line-numbers]) .line-numbers{display:block}
        pre {
          margin: 0;
          padding: 16px;
          overflow-x: auto;
          font-family: "Consolas", "Monaco", "Courier New", monospace;
          font-size: 13px;
          line-height: 1.6;
          color: var(--gl-fg);
          background: var(--gl-panel);
          flex:1;
        }
        code {
          font-family: inherit;
          display: block;
        }
        .fold-btn{
          display:none;
          all:unset;
          cursor:pointer;
          padding:4px 8px;
          border-radius:4px;
          font-size:12px;
          color:var(--gl-muted);
          transition:background var(--gl-dur-1) var(--gl-ease);
        }
        .fold-btn:hover{background:var(--gl-hover)}
        :host([foldable]) .fold-btn{display:inline-flex}
        :host([folded]) pre{max-height:200px;overflow:hidden}
        :host([folded]) .fold-btn::before{content:"Expand"}
        :host(:not([folded])[foldable]) .fold-btn::before{content:"Collapse"}
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
        ${showCopy || foldable ? `<div class="header">
          <span class="lang">${lang}</span>
          <div style="display:flex;gap:8px;align-items:center">
            ${foldable ? `<button class="fold-btn" part="fold-button" aria-label="Toggle code folding"></button>` : ""}
            ${showCopy ? `<button class="copyBtn" part="copy-button" aria-label="Copy code">Copy</button>` : ""}
          </div>
        </div>` : ""}
        <div class="code-wrapper">
          ${showLines ? `<div class="line-numbers" part="line-numbers"></div>` : ""}
          <pre part="pre"><code part="code"></code></pre>
        </div>
      </div>
    `;

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this.#pre = shadow.querySelector("pre")!;
    this.#code = shadow.querySelector("code")!;
    this.#lineNumbers = shadow.querySelector(".line-numbers") as HTMLElement;
    if (showCopy) {
      this.#copyBtn = shadow.querySelector(".copyBtn")!;
      this.#copyBtn.addEventListener("click", () => this.#copy());
    }
    if (foldable) {
      this.#foldBtn = shadow.querySelector(".fold-btn")!;
      this.#foldBtn.addEventListener("click", () => this.toggleAttribute("folded"));
    }

    this.#highlight(this.#codeContent, lang);
    if (showLines) {
      this.#updateLineNumbers();
    }
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
    } else if (lang === "py" || lang === "python") {
      this.#code.innerHTML = this.#highlightPython(code);
    } else if (lang === "bash" || lang === "sh" || lang === "shell") {
      this.#code.innerHTML = this.#highlightBash(code);
    } else if (lang === "md" || lang === "markdown") {
      this.#code.innerHTML = this.#highlightMarkdown(code);
    } else {
      this.#code.textContent = code;
    }
    
    if (this.hasAttribute("line-numbers")) {
      this.#updateLineNumbers();
    }
  }

  #updateLineNumbers() {
    if (!this.#lineNumbers || !this.#code) return;
    const lines = this.#codeContent.split("\n").length;
    this.#lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br>");
  }

  #highlightPython(code: string): string {
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
    highlighted = highlighted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
    highlighted = highlighted.replace(/\b(0x[\da-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g, '<span class="number">$1</span>');
    const keywords = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|lambda|yield|async|await|True|False|None|and|or|not|in|is|del|global|nonlocal|pass|break|continue|assert)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="keyword">$&</span>');
    highlighted = highlighted.replace(/([+\-*/%=<>!&|?:]+)/g, '<span class="operator">$1</span>');
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span class="function">$1</span> ');
    return highlighted;
  }

  #highlightBash(code: string): string {
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
    highlighted = highlighted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
    highlighted = highlighted.replace(/\$\{[^}]+\}|\$[a-zA-Z_][a-zA-Z0-9_]*/g, '<span class="variable">$&</span>');
    const keywords = /\b(if|then|else|elif|fi|case|esac|for|while|until|do|done|function|select|time|coproc)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="keyword">$&</span>');
    return highlighted;
  }

  #highlightMarkdown(code: string): string {
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    highlighted = highlighted.replace(/(^#{1,6}\s+.+$)/gm, '<span class="keyword">$1</span>');
    highlighted = highlighted.replace(/(\*\*|__)(.+?)\1/g, '<span class="keyword">$2</span>');
    highlighted = highlighted.replace(/(\*|_)(.+?)\1/g, '<span class="property">$2</span>');
    highlighted = highlighted.replace(/(`)(.+?)\1/g, '<span class="string">$2</span>');
    highlighted = highlighted.replace(/(\[.+?\]\(.+?\))/g, '<span class="function">$1</span>');
    return highlighted;
  }

  #highlightHTML(code: string): string {
    // First escape HTML entities
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Comments (must be first)
    highlighted = highlighted.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="comment">$1</span>');
    
    // HTML tags - handle both opening and closing tags
    highlighted = highlighted.replace(/&lt;(\/?)([\w-]+)([^&]*?)&gt;/g, (_, close, tag, attrs) => {
      // Highlight attributes with better regex
      const attrsHighlighted = attrs
        .replace(/(\s+)([\w-]+)(=)(["'][^"']*["'])/g, '$1<span class="attr-name">$2</span><span class="operator">$3</span><span class="attr-value">$4</span>')
        .replace(/(\s+)([\w-]+)(\s|&gt;)/g, '$1<span class="attr-name">$2</span>$3');
        return `<span class="tag">&lt;${close}${tag}</span>${attrsHighlighted}<span class="tag">&gt;</span>`;
      });
    
    return highlighted;
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
    // First escape HTML entities
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Comments (must be first to avoid breaking other patterns)
    highlighted = highlighted.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>');
    
    // Template literals and strings (before other patterns)
    highlighted = highlighted.replace(/(`[^`]*`)/g, '<span class="string">$1</span>');
    highlighted = highlighted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
    
    // Regex literals
    highlighted = highlighted.replace(/(\/[^\/\n]+\/[gimuy]*)/g, '<span class="regex">$1</span>');
    
    // Numbers (including hex, binary, etc.)
    highlighted = highlighted.replace(/\b(0x[\da-fA-F]+|0b[01]+|0o[0-7]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g, '<span class="number">$1</span>');
    
    // Keywords
    const keywords = /\b(const|let|var|function|if|else|for|while|return|class|extends|import|export|from|default|async|await|try|catch|throw|new|this|super|static|public|private|protected|interface|type|enum|namespace|declare|as|of|in|typeof|instanceof|true|false|null|undefined|void|break|continue|switch|case|do|with|yield|get|set|delete|void|of|in)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="keyword">$&</span>');
    
    // Operators
    highlighted = highlighted.replace(/([+\-*/%=<>!&|?:]+)/g, '<span class="operator">$1</span>');
    
    // Functions and method calls
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="function">$1</span> ');
    
    // Constants (uppercase identifiers)
    highlighted = highlighted.replace(/\b([A-Z][A-Z0-9_]*)\b/g, (match, p1) => {
      // Don't highlight if already highlighted as keyword
      if (match.includes('class=') || match.includes('span')) return match;
      return `<span class="constant">${p1}</span>`;
    });
    
    // Properties (after dot or bracket)
    highlighted = highlighted.replace(/(\.)([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '$1<span class="property">$2</span>');
    
    return highlighted;
  }

  #highlightJSX(code: string): string {
    // First escape HTML entities
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Comments (must be first)
    highlighted = highlighted.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>');
    
    // JSX tags - handle both opening and closing tags, including self-closing
    highlighted = highlighted.replace(/&lt;(\/?)([\w-]+)([^&]*?)(\/?)&gt;/g, (match, close, tag, attrs, selfClose) => {
      // Highlight attributes with better regex
      let attrsHighlighted = attrs
        // Attribute with quoted value
        .replace(/(\s+)([\w-]+)(=)(["'][^"']*["'])/g, '$1<span class="attr-name">$2</span><span class="operator">$3</span><span class="attr-value">$4</span>')
        // Attribute with JSX expression
        .replace(/(\s+)([\w-]+)(=)(\{[^}]*\})/g, '$1<span class="attr-name">$2</span><span class="operator">$3</span><span class="attr-value">$4</span>')
        // Boolean attributes
        .replace(/(\s+)([\w-]+)(\s|&gt;)/g, '$1<span class="attr-name">$2</span>$3');
      
      const closing = selfClose ? '/' : '';
      return `<span class="tag">&lt;${close}${tag}</span>${attrsHighlighted}${closing ? '<span class="operator">/</span>' : ''}<span class="tag">&gt;</span>`;
    });
    
    // JSX expressions { ... }
    highlighted = highlighted.replace(/(\{)([^}]*)(\})/g, '<span class="punctuation">$1</span>$2<span class="punctuation">$3</span>');
    
    // Template literals and strings (after JSX tags)
    highlighted = highlighted.replace(/(`[^`]*`)/g, '<span class="string">$1</span>');
    highlighted = highlighted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
    
    // Numbers
    highlighted = highlighted.replace(/\b(0x[\da-fA-F]+|0b[01]+|0o[0-7]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g, '<span class="number">$1</span>');
    
    // Keywords
    const keywords = /\b(const|let|var|function|if|else|for|while|return|class|extends|import|export|from|default|async|await|try|catch|throw|new|this|super|static|public|private|protected|interface|type|enum|namespace|declare|as|of|in|typeof|instanceof|true|false|null|undefined|void|break|continue|switch|case|do|with|yield|get|set|delete)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="keyword">$&</span>');
    
    // Operators
    highlighted = highlighted.replace(/([+\-*/%=<>!&|?:]+)/g, '<span class="operator">$1</span>');
    
    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="function">$1</span> ');
    
    return highlighted;
  }

  #highlightJSON(code: string): string {
    // First escape HTML entities
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Keys (property names)
    highlighted = highlighted.replace(/(["'])([^"']*)(["'])(\s*)(:)/g, '<span class="property"><span class="string">$1$2$3</span></span>$4<span class="operator">$5</span>');
    
    // String values (not already highlighted as keys)
    highlighted = highlighted.replace(/(:\s*)(["'])([^"']*)(["'])/g, '$1<span class="string">$2$3$4</span>');
    
    // Numbers
    highlighted = highlighted.replace(/(:\s*)(\d+\.?\d*(?:[eE][+-]?\d+)?)/g, '$1<span class="number">$2</span>');
    
    // Booleans and null
    highlighted = highlighted.replace(/(:\s*)(true|false|null)\b/g, '$1<span class="constant">$2</span>');
    
    // Punctuation
    highlighted = highlighted.replace(/([{}[\],])/g, '<span class="punctuation">$1</span>');
    
    return highlighted;
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
