<div align="center">

# ✨ Glint

**Modern, minimal UI components built with Web Components + Shadow DOM**

[![npm version](https://img.shields.io/npm/v/@glint-ui/glint?style=for-the-badge&color=693B93)](https://www.npmjs.com/package/@glint-ui/glint)
[![License](https://img.shields.io/npm/l/@glint-ui/glint?style=for-the-badge&color=693B93)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen?style=for-the-badge)](package.json)

**One CSS file. One JS file. Zero dependencies.**

[Documentation](#-documentation) • [Components](#-components) • [Examples](#-examples) • [Installation](#-installation)

</div>

---

## 🚀 Why Glint?

**Glint** is a modern, lightweight UI component library built with **Web Components** and **Shadow DOM**. Inspired by shadcn/ui's elegant API and UX, Glint ships as a single JavaScript file and CSS file—no build step required.

### ✨ Key Features

- 🎯 **Zero Dependencies** - One CSS file, one JS file. No build step required.
- ♿ **Fully Accessible** - Built with ARIA attributes, keyboard navigation, and focus management.
- 🌙 **Dark Mode Ready** - System preference detection and manual theme switching out of the box.
- 🎨 **Highly Customizable** - CSS custom properties for easy theming and customization.
- 🎭 **Motion Options** - Subtle, snappy, or bounce animations. Respects `prefers-reduced-motion`.
- 🔒 **Shadow DOM** - Styles are encapsulated. No CSS conflicts. Works alongside any stylesheet.
- 📦 **Tree Shakeable** - Import only what you need. ESM and CommonJS support.
- 🚀 **Framework Agnostic** - Works with React, Vue, Angular, Svelte, or vanilla JavaScript.
- ⚙️ **TypeScript Ready** - Full TypeScript support with comprehensive type definitions.
- 🎪 **30+ Components** - Buttons, forms, navigation, overlays, feedback, and more.

---

## 📦 Installation

### npm

```bash
npm install @glint-ui/glint
```

### CDN / Plain HTML

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@glint-ui/glint/dist/glint.css" />
<script src="https://cdn.jsdelivr.net/npm/@glint-ui/glint/dist/glint.js"></script>
```

### ESM

```typescript
import "@glint-ui/glint/glint.css";
import { defineGlint } from "@glint-ui/glint";

defineGlint();
```

### CommonJS

```javascript
require("@glint-ui/glint/glint.css");
const { defineGlint } = require("@glint-ui/glint");

defineGlint();
```

---

## 🎯 Quick Start

```html
<!DOCTYPE html>
<html lang="en" class="glint" data-glint-theme="system">
<head>
  <link rel="stylesheet" href="./dist/glint.css" />
</head>
<body>
  <gl-button motion="snappy">Click me</gl-button>
  <gl-input placeholder="Enter your email">
    <span slot="label">Email</span>
  </gl-input>
  <gl-card surface="glass" effect="tilt">
    <div slot="header">
      <div style="font-weight: 600">Card Title</div>
    </div>
    Card content goes here
  </gl-card>

  <script src="./dist/glint.js"></script>
</body>
</html>
```

---

## 🎨 Theming & Customization

Glint uses CSS custom properties for easy theming. Set theme on any container:

```html
<html class="glint" data-glint-theme="dark">
```

Supported themes:
- `data-glint-theme="light"` - Light mode
- `data-glint-theme="dark"` - Dark mode
- `data-glint-theme="system"` - Follows system preference

Override design tokens:

```css
:root {
  --gl-primary: #693B93;
  --gl-radius: 16px;
  --gl-space-4: 20px;
}
```

---

## 🎭 Motion & Animations

Most components support customizable motion:

```html
<gl-button motion="subtle">Subtle</gl-button>
<gl-button motion="snappy">Snappy</gl-button>
<gl-button motion="bounce">Bounce</gl-button>
<gl-button motion="none">No animation</gl-button>
```

Glint automatically respects `prefers-reduced-motion` for accessibility.

---

## 🎪 Components

### Form Controls
- **Button** - Multiple variants, sizes, and motion options
- **Input** - Text input with validation states
- **Textarea** - Multi-line text input
- **Select** - Dropdown select with options
- **Checkbox** - Selection checkbox
- **Radio** - Radio button groups
- **Switch** - Toggle switch
- **Slider** - Range input with keyboard support

### Layout & Navigation
- **Card** - Container with header, body, footer slots
- **Navbar** - Navigation bar with brand, nav links, and actions
- **Topbar** - Top bar with left, center, right slots
- **Tabs** - Tabbed interface with keyboard navigation
- **Accordion** - Collapsible content panels
- **Breadcrumb** - Navigation trail
- **Pagination** - Page navigation controls

### Overlays & Modals
- **Modal** - Dialog with focus trap and backdrop
- **Sidebar** - Slide-out panel
- **Popover** - Positioned popup with rich content
- **Tooltip** - Hover/focus tooltip
- **Dropdown** - Menu dropdown

### Feedback & Display
- **Alert** - Alert messages with variants
- **Toast** - Notification toasts with auto-dismiss
- **Progress** - Progress bar with animation
- **Spinner** - Loading spinner
- **Badge** - Status indicator
- **Avatar** - User avatar with status
- **Skeleton** - Loading placeholders
- **Divider** - Horizontal and vertical dividers

### Code & Data
- **Codeblock** - Syntax-highlighted code blocks with copy
- **Table** - Data tables with variants

---

## 📚 Documentation

### Full Component Documentation

Visit our [component gallery](examples/components.html) for complete documentation, examples, and API reference.

### Key Concepts

#### Effects & Surfaces

```html
<!-- Glassmorphism effect -->
<gl-card surface="glass">...</gl-card>

<!-- 3D tilt effect on hover -->
<gl-card effect="tilt" motion="snappy">...</gl-card>

<!-- Both effects -->
<gl-card surface="glass" effect="tilt">...</gl-card>
```

#### Component Triggers

Auto-wire buttons to open/close components without JavaScript:

```html
<gl-button trigger="modal:myModal">Open Modal</gl-button>
<gl-button trigger="sidebar:mySidebar">Open Sidebar</gl-button>
<gl-button trigger="toast" toast-title="Success!" toast-description="Action completed">Show Toast</gl-button>
<gl-button trigger="close:myModal">Close</gl-button>
```

#### Gradient Text

```html
<h1 class="gl-gradient-text" data-animate="true">Animated Gradient</h1>
```

---

## 🌟 Use Cases

- **Dashboard Applications** - Build powerful admin panels with comprehensive components
- **Form Heavy Applications** - Create beautiful, accessible forms with validation
- **Marketing Websites** - Stunning landing pages with glassmorphism and animations
- **Web Applications** - Framework-agnostic components for any stack
- **Design Systems** - Customizable foundation for your design system

---

## 🔧 Framework Integration

### React

```tsx
import { useEffect } from 'react';
import '@glint-ui/glint/glint.css';
import { defineGlint } from '@glint-ui/glint';

function App() {
  useEffect(() => {
    defineGlint();
  }, []);

  return <gl-button>Click me</gl-button>;
}
```

### Vue

```vue
<template>
  <gl-button>Click me</gl-button>
</template>

<script setup>
import '@glint-ui/glint/glint.css';
import { defineGlint } from '@glint-ui/glint';

defineGlint();
</script>
```

### Angular

```typescript
import { Component, OnInit } from '@angular/core';
import '@glint-ui/glint/glint.css';
import { defineGlint } from '@glint-ui/glint';

@Component({
  selector: 'app-root',
  template: '<gl-button>Click me</gl-button>'
})
export class AppComponent implements OnInit {
  ngOnInit() {
    defineGlint();
  }
}
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format:write
```

### Examples

After building, open:
- `examples/index.html` - Marketing homepage
- `examples/components.html` - Component gallery and documentation

---

## 📊 Browser Support

Glint works in all modern browsers that support:
- Web Components (Custom Elements v1)
- Shadow DOM v1
- CSS Custom Properties

**Supported browsers:**
- Chrome/Edge 67+
- Firefox 63+
- Safari 10.1+
- Opera 54+

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by [shadcn/ui](https://ui.shadcn.com/) structure, API, and UX
- Built with modern web standards and best practices

---

<div align="center">

**Made with ❤️ by [Amped](https://github.com/glint-ui)**

[⭐ Star on GitHub](https://github.com/glint-ui/glint) • [📖 Documentation](examples/components.html) • [🐛 Report Bug](https://github.com/glint-ui/glint/issues) • [💡 Request Feature](https://github.com/glint-ui/glint/issues)

</div>
