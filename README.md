<div align="center">

<p align="center">
  <img src="https://i.postimg.cc/Nf5mThW2/Chat-GPT-Image-Jan-21-2026-10-06-54-AM-(1).png" alt="Glint" width="180" />
</p>

**Modern, minimal Web Components UI library built with Shadow DOM**

[![npm version](https://img.shields.io/npm/v/@amped17/glint-ui?style=for-the-badge&color=693B93)](https://www.npmjs.com/package/@amped17/glint-ui)
[![License](https://img.shields.io/npm/l/@amped17/glint-ui?style=for-the-badge&color=693B93)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen?style=for-the-badge)](package.json)

**One CSS file. One JS file. Zero dependencies.**

### TL;DR
- 🎯 **Framework agnostic** - Works with React, Vue, Angular, Svelte, or vanilla JS
- 📦 **Zero dependencies** - One CSS file, one JS file, no build step required
- 🎨 **50+ components** - Complete UI library with forms, navigation, overlays, and layout components

[Documentation](#-documentation) • [Components](#-components) • [Quick Start](#-quick-start) • [Installation](#-installation)

</div>

---

## 🚀 Why Glint?

**Glint** is a modern, lightweight **Web Components UI library** built with **Shadow DOM**. Inspired by shadcn/ui's elegant API and UX, Glint ships as a single JavaScript file and CSS file—no build step required. Perfect for building framework-agnostic UI components that work everywhere.

### ✨ Key Features

- 🎯 **Zero Dependencies** - One CSS file, one JS file. No build step required.
- ♿ **Fully Accessible** - Built with ARIA attributes, keyboard navigation, and focus management.
- 🌙 **Dark Mode Ready** - System preference detection and manual theme switching out of the box.
- 🎨 **Highly Customizable** - CSS custom properties for easy theming and customization.
- 🎭 **Motion Options** - Subtle, snappy, or bounce animations. Respects `prefers-reduced-motion`.
- 🔒 **Shadow DOM** - Styles are encapsulated. No CSS conflicts. Works alongside any stylesheet.
- 📦 **Tree Shakeable** - Import only what you need (ESM). Shadow DOM encapsulation doesn't prevent tree-shaking of unused component definitions.
- 🚀 **Framework Agnostic** - Works with React, Vue, Angular, Svelte, or vanilla JavaScript.
- ⚙️ **TypeScript Ready** - Full TypeScript support with comprehensive type definitions.
- 🎪 **50+ Components** - [Complete component list](#-components) with forms, navigation, overlays, feedback, and layout components.

---

## 🎯 Quick Start

```html
<!DOCTYPE html>
<html lang="en" class="glint">
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@amped17/glint-ui@0.2.0/dist/glint.css" />
</head>
<body>
  <gl-button>Click me</gl-button>
  <script src="https://cdn.jsdelivr.net/npm/@amped17/glint-ui@0.2.0/dist/glint.js"></script>
</body>
</html>
```

That's it! The `defineGlint()` function is called automatically and is **idempotent** (safe to call multiple times).

---

## 📦 Installation

### npm

```bash
npm install @amped17/glint-ui
```

### CDN / Plain HTML

```html
<!-- Recommended: Pin to specific version for stability -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@amped17/glint-ui@0.2.0/dist/glint.css" />
<script src="https://cdn.jsdelivr.net/npm/@amped17/glint-ui@0.2.0/dist/glint.js"></script>
```

**Note:** Always pin to a specific version in production. The CDN script automatically calls `defineGlint()` (idempotent).

### ESM

```typescript
import "@amped17/glint-ui/glint.css";
import { defineGlint } from "@amped17/glint-ui";

defineGlint(); // Idempotent - safe to call multiple times
```

### CommonJS

```javascript
require("@amped17/glint-ui/glint.css");
const { defineGlint } = require("@amped17/glint-ui");

defineGlint(); // Idempotent - safe to call multiple times
```

---

## 📊 Browser Support

Glint works in all modern browsers that support Web Components (Custom Elements v1) and Shadow DOM v1.

**Supported browsers:**
- Chrome/Edge 67+
- Firefox 63+
- Safari 10.1+
- Opera 54+

**Note:** Glint requires CSS Custom Properties support, which is available in all modern browsers listed above.

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
- **Date Picker** - Calendar-based date selection with range support (advanced)
- **Time Picker** - Time selection input with custom picker UI
- **Color Picker** - Color selection with hex/rgb/hsl support
- **File Upload** - Drag & drop file upload with preview and validation
- **Search Input** - Search input with autocomplete suggestions
- **Tag Input** - Multi-tag input with add/remove functionality
- **Rating** - Star rating component with keyboard navigation
- **Form** - Form wrapper with validation and submission handling

### Layout & Navigation
- **Card** - Container with header, body, footer slots
- **Navbar** - Navigation bar with brand, nav links, and actions
- **Topbar** - Top bar with left, center, right slots
- **Tabs** - Tabbed interface with keyboard navigation
- **Accordion** - Collapsible content panels
- **Breadcrumb** - Navigation trail
- **Pagination** - Page navigation controls
- **Stepper** - Step-by-step wizard component with navigation
- **Menu** - Context menu with keyboard navigation
- **Command Palette** - Command palette with search and keyboard shortcuts (advanced)
- **Split Pane** - Resizable split pane layout
- **Stack** - Flexbox and Grid layout component
- **Container** - Responsive container component

### Overlays & Modals
- **Modal** - Dialog with focus trap and backdrop
- **Drawer** - Slide-out drawer component with backdrop and multiple positions
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
- **Link** - Styled link component with variants

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
<gl-button trigger="drawer:myDrawer">Open Drawer</gl-button>
<gl-button trigger="toast" toast-title="Success!" toast-description="Action completed">Show Toast</gl-button>
<gl-button trigger="close:myModal">Close</gl-button>
```

#### Gradient Text

```html
<h1 class="gl-gradient-text" data-animate="true">Animated Gradient</h1>
```

---

## 🌟 Use Cases

- **Dashboard & Admin Panels** - Complete admin interfaces with command palettes, data tables, navigation, and modals
- **Form Heavy Applications** - Beautiful, accessible forms with validation, date/time pickers, file uploads, and multi-step wizards
- **Marketing Websites** - Stunning landing pages with glassmorphism effects and smooth animations
- **Design Systems** - Customizable foundation for building your own design system
- **Framework-Agnostic Projects** - Works seamlessly with React, Vue, Angular, Svelte, or vanilla JavaScript

---

## 🔧 Framework Integration

### React

```tsx
import { useEffect } from 'react';
import '@amped17/glint-ui/glint.css';
import { defineGlint } from '@amped17/glint-ui';

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
import '@amped17/glint-ui/glint.css';
import { defineGlint } from '@amped17/glint-ui';

defineGlint();
</script>
```

### Angular

```typescript
import { Component, OnInit } from '@angular/core';
import '@amped17/glint-ui/glint.css';
import { defineGlint } from '@amped17/glint-ui';

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

Glint works in all modern browsers that support Web Components (Custom Elements v1) and Shadow DOM v1.

**Supported browsers:**
- Chrome/Edge 67+
- Firefox 63+
- Safari 10.1+
- Opera 54+

**Note:** Glint requires CSS Custom Properties support, which is available in all modern browsers listed above.

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

## 🔄 Comparison

### Glint vs Other Libraries

| Feature | Glint | shadcn/ui | Radix UI | Shoelace |
|---------|-------|-----------|----------|----------|
| **Framework** | Web Components | React | React | Web Components |
| **Shadow DOM** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **Zero Dependencies** | ✅ Yes | ⚠️ React required | ⚠️ React required | ✅ Yes |
| **Framework Agnostic** | ✅ Yes | ❌ React only | ❌ React only | ✅ Yes |
| **Build Step Required** | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| **TypeScript** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Tree Shakeable** | ✅ Yes (ESM) | ✅ Yes | ✅ Yes | ✅ Yes |

**When to choose Glint:**
- You need framework-agnostic components
- You want zero dependencies and no build step
- You're building with vanilla JavaScript or multiple frameworks
- You need Shadow DOM encapsulation for style isolation

---

## 🙏 Acknowledgments

- Inspired by [shadcn/ui](https://ui.shadcn.com/) structure, API, and UX
- Built with modern web standards and best practices

---

<div align="center">

**Made with ❤️ by [Amped](https://github.com/AmpedWasTaken)**

[⭐ Star on GitHub](https://github.com/AmpedWasTaken/Glint) • [📖 Documentation](examples/components.html) • [🐛 Report Bug](https://github.com/AmpedWasTaken/Glint/issues) • [💡 Request Feature](https://github.com/AmpedWasTaken/Glint/issues)

</div>
