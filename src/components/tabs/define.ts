import { define } from "../../internal/define.js";

import { GlTab, GlTabPanel, GlTabs } from "./tabs.js";

export function defineTabs(): void {
  define(GlTabs.tagName, GlTabs);
  define(GlTab.tagName, GlTab);
  define(GlTabPanel.tagName, GlTabPanel);
}

export { GlTabs, GlTab, GlTabPanel };
