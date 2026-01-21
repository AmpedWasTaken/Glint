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

## Motion

Most interactive components support `motion`:

- `motion="subtle"` (default feel)
- `motion="snappy"` (more expressive)
- `motion="bounce"` (playful overshoot)
- `motion="none"` (no animation)

Examples:

```html
<gl-button motion="snappy">Snappy</gl-button>
<gl-modal motion="subtle" open>...</gl-modal>
<gl-toast motion="none">...</gl-toast>
<gl-sidebar motion="snappy">...</gl-sidebar>
```

Glint also respects `prefers-reduced-motion`.

## Effects + Surfaces

Some components support extra “feel” controls:

- **`surface="glass"`**: glassmorphism look (blur + translucent surface)
- **`effect="tilt"`**: 3D hover tilt (on `gl-card`, respects reduced motion)
- **`side="right"`**: right-aligned sidebar drawer (on `gl-sidebar`)

Examples:

```html
<gl-card surface="glass" effect="tilt">...</gl-card>
<gl-sidebar side="right" surface="glass" motion="snappy">...</gl-sidebar>
```

## Text effects (gradients)

Glint ships with a small utility class for gradient text:

```html
<h1 class="gl-gradient-text">Glint</h1>
<h1 class="gl-gradient-text" data-animate="true">Animated</h1>
```

Customize the gradient stops (up to 4), angle, and speed:

```html
<h1
  class="gl-gradient-text"
  data-animate="true"
  style="
    --gl-grad-1: #7dd3fc;
    --gl-grad-2: #a78bfa;
    --gl-grad-3: #fb7185;
    --gl-grad-4: #34d399;
    --gl-grad-angle: 120deg;
    --gl-grad-speed: 5s;
  "
>
  Glint
</h1>
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

Card effects:

```html
<gl-card effect="tilt" surface="glass" motion="snappy">
  <div slot="header">
    <div style="font-weight: 600">Tilt + Glass</div>
    <div style="color: var(--gl-muted)">Pointer-based 3D hover</div>
  </div>
  Content
</gl-card>
```

### Sidebar

```html
<gl-sidebar side="right" surface="glass" motion="snappy">
  <span slot="title">Menu</span>
  ...
</gl-sidebar>
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

### Switch

```html
<gl-switch checked motion="snappy"></gl-switch>
```

Attributes:

- `checked` — toggle state
- `disabled` — disable interaction
- `size` — `sm`, `md` (default), `lg`
- `motion` — `none`, `subtle`, `snappy`, `bounce`

Events:

- `gl-change` — `{ checked: boolean }`

### Slider

```html
<gl-slider value="50" min="0" max="100" step="1" motion="snappy"></gl-slider>
```

Attributes:

- `value` — current value (number)
- `min` — minimum value (default: `0`)
- `max` — maximum value (default: `100`)
- `step` — step size (default: `1`)
- `disabled` — disable interaction
- `size` — `sm`, `md` (default), `lg`
- `motion` — `none`, `subtle`, `snappy`, `bounce`

Events:

- `gl-change` — `{ value: number }`

### Avatar

```html
<gl-avatar name="John Doe" size="lg" status="online"></gl-avatar>
<gl-avatar src="https://example.com/avatar.jpg" alt="User" size="md"></gl-avatar>
```

Attributes:

- `name` — name for initials (if no `src`)
- `src` — image URL
- `alt` — image alt text
- `size` — `sm`, `md` (default), `lg`, `xl`
- `status` — `online`, `away`, `busy`, `offline`
- `motion` — `none`, `subtle`, `snappy`, `bounce`

### Dropdown

```html
<gl-dropdown motion="snappy">
  <gl-button slot="trigger">Menu</gl-button>
  <button class="item" data-value="edit">Edit</button>
  <button class="item" data-value="delete">Delete</button>
  <div class="divider"></div>
  <button class="item" data-value="more">More</button>
</gl-dropdown>
```

Attributes:

- `open` — control visibility
- `side` — `left` (default), `right`, `top`
- `motion` — `none`, `subtle`, `snappy`, `bounce`

Methods:

- `show()` — open dropdown
- `close(reason)` — close dropdown
- `toggle()` — toggle open state

Events:

- `gl-select` — `{ value: string, index: number }`
- `gl-close` — `{ reason: string }`

Note: Use `.item` class for menu items and `.divider` for separators.

### Skeleton

```html
<gl-skeleton width="100%" height="20px" variant="shimmer"></gl-skeleton>
<gl-skeleton width="40px" height="40px" shape="circle" variant="pulse"></gl-skeleton>
```

Attributes:

- `width` — CSS width (default: `100%`)
- `height` — CSS height (default: `20px`)
- `variant` — `shimmer` (default), `pulse`, `wave`, `none`
- `shape` — `rect` (default), `circle`, `text`

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

## Examples

After `npm run build`, open:

- `examples/index.html` (homepage)
- `examples/components.html` (component gallery)

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
