# Glint

<p align="center">
  <img src="https://i.postimg.cc/Nf5mThW2/Chat-GPT-Image-Jan-21-2026-10-06-54-AM-(1).png" alt="Glint" width="180" />
</p>

<p align="center">
  Modern, minimal UI components built with Web Components + Shadow DOM.
  <br />
  Inspired by shadcn/ui structure, API, and UX — shipped as one JS file and one CSS file.
</p>

## Install

### npm

```bash
npm i @glint-ui/glint
```

### CDN / plain HTML

Build once, then link the output:

```html
<link rel="stylesheet" href="./dist/glint.css" />
<script src="./dist/glint.js"></script>
```

Glint auto-defines custom elements when loaded in the browser. If you want manual control:

```html
<script src="./dist/glint.js"></script>
<script>
  // window.Glint.define()
  Glint.define();
</script>
```

## Usage

### ESM

```ts
import "@glint-ui/glint/glint.css";
import { defineGlint } from "@glint-ui/glint";

defineGlint();
```

### CommonJS

```js
require("@glint-ui/glint/glint.css");
const { defineGlint } = require("@glint-ui/glint");

defineGlint();
```

## Theme + Dark mode

Glint uses CSS custom properties. Set theme on any container (usually `html` or `body`):

```html
<html class="glint" data-glint-theme="light">
  ...
</html>
```

Supported values:

- `data-glint-theme="light"`
- `data-glint-theme="dark"`
- `data-glint-theme="system"` (uses `prefers-color-scheme`)

Override tokens anywhere:

```css
:root {
  --gl-radius: 14px;
  --gl-primary: #7c3aed;
}
```

## Components

### Button

```html
<gl-button>Primary</gl-button>
<gl-button variant="secondary">Secondary</gl-button>
<gl-button variant="ghost">Ghost</gl-button>
<gl-button variant="destructive">Delete</gl-button>
<gl-button size="sm">Small</gl-button>
<gl-button size="lg">Large</gl-button>
```

Events:

- `gl-press`

### Card

```html
<gl-card>
  <div slot="header">
    <div slot="title">Card title</div>
    <div slot="description">Card description</div>
  </div>
  Card body content
  <div slot="footer">
    <gl-button variant="secondary">Cancel</gl-button>
    <gl-button>Save</gl-button>
  </div>
</gl-card>
```

### Input

```html
<gl-input placeholder="Email">
  <span slot="label">Email</span>
  <span slot="description">We’ll never share it.</span>
</gl-input>
```

Events:

- `gl-change` (on input)
- `gl-commit` (on change)

### Select

`options` may be provided as a JSON attribute:

```html
<gl-select
  value="design"
  options='[{"value":"design","label":"Design"},{"value":"engineering","label":"Engineering"}]'
>
  <span slot="label">Team</span>
</gl-select>
```

Events:

- `gl-change`

### Checkbox

```html
<gl-checkbox checked>Remember me</gl-checkbox>
```

Events:

- `gl-change`

### Radio

```html
<gl-radio name="plan" value="starter" checked>Starter</gl-radio>
<gl-radio name="plan" value="pro">Pro</gl-radio>
```

Events:

- `gl-change`

### Tooltip

```html
<gl-tooltip>
  <gl-button variant="secondary">Hover</gl-button>
  <span slot="content">Helpful info</span>
</gl-tooltip>
```

### Accordion

```html
<gl-accordion>
  <gl-accordion-item open>
    <span slot="title">What is Glint?</span>
    Minimal Web Components UI library.
  </gl-accordion-item>
  <gl-accordion-item>
    <span slot="title">Does it support keyboard?</span>
    Yes.
  </gl-accordion-item>
</gl-accordion>
```

For multiple open panels:

```html
<gl-accordion multiple>...</gl-accordion>
```

Events:

- `gl-toggle` (on `gl-accordion-item`)

### Tabs

```html
<gl-tabs value="account">
  <gl-tab slot="tabs" value="account">Account</gl-tab>
  <gl-tab slot="tabs" value="security">Security</gl-tab>

  <gl-tab-panel slot="panels" value="account">Account panel</gl-tab-panel>
  <gl-tab-panel slot="panels" value="security">Security panel</gl-tab-panel>
</gl-tabs>
```

Events:

- `gl-change` (on `gl-tabs`)

## Local development

```bash
npm i
npm run dev
```

Build:

```bash
npm run build
```

Outputs:

- `dist/glint.js` (browser bundle)
- `dist/index.mjs` (ESM)
- `dist/index.cjs` (CommonJS)
- `dist/glint.css`
- `dist/index.d.ts`

## License

MIT
