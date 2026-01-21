import "./styles/glint.css";

import { defineAccordion } from "./components/accordion/define.js";
import { defineAlert } from "./components/alert/define.js";
import { defineAvatar } from "./components/avatar/define.js";
import { defineBadge } from "./components/badge/define.js";
import { defineButton } from "./components/button/define.js";
import { defineCard } from "./components/card/define.js";
import { defineCheckbox } from "./components/checkbox/define.js";
import { defineDivider } from "./components/divider/define.js";
import { defineDropdown } from "./components/dropdown/define.js";
import { defineInput } from "./components/input/define.js";
import { defineModal } from "./components/modal/define.js";
import { defineProgress } from "./components/progress/define.js";
import { defineRadio } from "./components/radio/define.js";
import { defineSelect } from "./components/select/define.js";
import { defineSidebar } from "./components/sidebar/define.js";
import { defineSkeleton } from "./components/skeleton/define.js";
import { defineSlider } from "./components/slider/define.js";
import { defineSpinner } from "./components/spinner/define.js";
import { defineSwitch } from "./components/switch/define.js";
import { defineTabs } from "./components/tabs/define.js";
import { defineToast } from "./components/toast/define.js";
import { defineTooltip } from "./components/tooltip/define.js";

export { defineAccordion, GlAccordion, GlAccordionItem } from "./components/accordion/define.js";
export { defineAlert, GlAlert } from "./components/alert/define.js";
export { defineAvatar, GlAvatar } from "./components/avatar/define.js";
export { defineBadge, GlBadge } from "./components/badge/define.js";
export { defineButton, GlButton } from "./components/button/define.js";
export { defineCard, GlCard } from "./components/card/define.js";
export { defineCheckbox, GlCheckbox } from "./components/checkbox/define.js";
export { defineDivider, GlDivider } from "./components/divider/define.js";
export { defineDropdown, GlDropdown } from "./components/dropdown/define.js";
export { defineInput, GlInput } from "./components/input/define.js";
export { defineModal, GlModal } from "./components/modal/define.js";
export { defineProgress, GlProgress } from "./components/progress/define.js";
export { defineRadio, GlRadio } from "./components/radio/define.js";
export { defineSelect, GlSelect } from "./components/select/define.js";
export { defineSidebar, GlSidebar } from "./components/sidebar/define.js";
export { defineSkeleton, GlSkeleton } from "./components/skeleton/define.js";
export { defineSlider, GlSlider } from "./components/slider/define.js";
export { defineSpinner, GlSpinner } from "./components/spinner/define.js";
export { defineSwitch, GlSwitch } from "./components/switch/define.js";
export { defineTabs, GlTabs, GlTab, GlTabPanel } from "./components/tabs/define.js";
export { defineToast, GlToast, GlToaster } from "./components/toast/define.js";
export { defineTooltip, GlTooltip } from "./components/tooltip/define.js";

export function defineGlint(): void {
  defineAccordion();
  defineAlert();
  defineAvatar();
  defineBadge();
  defineButton();
  defineCard();
  defineCheckbox();
  defineDivider();
  defineDropdown();
  defineInput();
  defineModal();
  defineProgress();
  defineRadio();
  defineSelect();
  defineSidebar();
  defineSkeleton();
  defineSlider();
  defineSpinner();
  defineSwitch();
  defineTabs();
  defineToast();
  defineTooltip();
}

declare global {
  interface Window {
    Glint?: {
      define: () => void;
    };
  }
}

if (typeof window !== "undefined") {
  window.Glint = window.Glint ?? { define: defineGlint };
  defineGlint();
}
