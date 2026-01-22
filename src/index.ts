import "./styles/glint.css";

export type {
  GlChangeDetail,
  GlCloseDetail,
  GlCommitDetail,
  GlPressDetail,
  GlSelectDetail
} from "./types.js";

import { defineAccordion } from "./components/accordion/define.js";
import { defineAlert } from "./components/alert/define.js";
import { defineAvatar } from "./components/avatar/define.js";
import { defineBadge } from "./components/badge/define.js";
import { defineButton } from "./components/button/define.js";
import { defineCard } from "./components/card/define.js";
import { defineCheckbox } from "./components/checkbox/define.js";
import { defineCodeblock } from "./components/codeblock/define.js";
import { defineBreadcrumb } from "./components/breadcrumb/define.js";
import { defineDivider } from "./components/divider/define.js";
import { defineLink } from "./components/link/define.js";
import { defineDropdown } from "./components/dropdown/define.js";
import { defineInput } from "./components/input/define.js";
import { defineModal } from "./components/modal/define.js";
import { defineNavbar } from "./components/navbar/define.js";
import { definePagination } from "./components/pagination/define.js";
import { definePopover } from "./components/popover/define.js";
import { defineProgress } from "./components/progress/define.js";
import { defineRadio } from "./components/radio/define.js";
import { defineSelect } from "./components/select/define.js";
import { defineSidebar } from "./components/sidebar/define.js";
import { defineSkeleton } from "./components/skeleton/define.js";
import { defineSlider } from "./components/slider/define.js";
import { defineSpinner } from "./components/spinner/define.js";
import { defineSwitch } from "./components/switch/define.js";
import { defineTextarea } from "./components/textarea/define.js";
import { defineTable } from "./components/table/define.js";
import { defineTabs } from "./components/tabs/define.js";
import { defineToast } from "./components/toast/define.js";
import { defineTooltip } from "./components/tooltip/define.js";
import { defineTopbar } from "./components/topbar/define.js";
import { defineDatePicker } from "./components/date-picker/define.js";
import { defineTimePicker } from "./components/time-picker/define.js";
import { defineColorPicker } from "./components/color-picker/define.js";
import { defineFileUpload } from "./components/file-upload/define.js";
import { defineRating } from "./components/rating/define.js";
import { defineSearchInput } from "./components/search-input/define.js";
import { defineTagInput } from "./components/tag-input/define.js";
import { defineForm } from "./components/form/define.js";
import { defineCommandPalette } from "./components/command-palette/define.js";
import { defineContainer } from "./components/container/define.js";
import { defineDrawer } from "./components/drawer/define.js";
import { defineMenu } from "./components/menu/define.js";
import { defineSplitPane } from "./components/split-pane/define.js";
import { defineStack } from "./components/stack/define.js";
import { defineStepper } from "./components/stepper/define.js";

export { defineAccordion, GlAccordion, GlAccordionItem } from "./components/accordion/define.js";
export { defineAlert, GlAlert } from "./components/alert/define.js";
export { defineAvatar, GlAvatar } from "./components/avatar/define.js";
export { defineBadge, GlBadge } from "./components/badge/define.js";
export { defineButton, GlButton } from "./components/button/define.js";
export { defineCard, GlCard } from "./components/card/define.js";
export { defineCheckbox, GlCheckbox } from "./components/checkbox/define.js";
export { defineCodeblock, GlCodeblock } from "./components/codeblock/define.js";
export { defineBreadcrumb, GlBreadcrumb, GlBreadcrumbItem } from "./components/breadcrumb/define.js";
export { defineDivider, GlDivider } from "./components/divider/define.js";
export { defineLink, GlLink } from "./components/link/define.js";
export { defineDropdown, GlDropdown } from "./components/dropdown/define.js";
export { defineInput, GlInput } from "./components/input/define.js";
export { defineModal, GlModal } from "./components/modal/define.js";
export { defineNavbar, GlNavbar } from "./components/navbar/define.js";
export { definePagination, GlPagination } from "./components/pagination/define.js";
export { definePopover, GlPopover } from "./components/popover/define.js";
export { defineProgress, GlProgress } from "./components/progress/define.js";
export { defineRadio, GlRadio } from "./components/radio/define.js";
export { defineSelect, GlSelect } from "./components/select/define.js";
export { defineSidebar, GlSidebar } from "./components/sidebar/define.js";
export { defineSkeleton, GlSkeleton } from "./components/skeleton/define.js";
export { defineSlider, GlSlider } from "./components/slider/define.js";
export { defineSpinner, GlSpinner } from "./components/spinner/define.js";
export { defineSwitch, GlSwitch } from "./components/switch/define.js";
export { defineTable, GlTable } from "./components/table/define.js";
export { defineTextarea, GlTextarea } from "./components/textarea/define.js";
export { defineTabs, GlTabs, GlTab, GlTabPanel } from "./components/tabs/define.js";
export { defineToast, GlToast, GlToaster } from "./components/toast/define.js";
export { defineTooltip, GlTooltip } from "./components/tooltip/define.js";
export { defineTopbar, GlTopbar } from "./components/topbar/define.js";
export { defineDatePicker, GlDatePicker } from "./components/date-picker/define.js";
export { defineTimePicker, GlTimePicker } from "./components/time-picker/define.js";
export { defineColorPicker, GlColorPicker } from "./components/color-picker/define.js";
export { defineFileUpload, GlFileUpload } from "./components/file-upload/define.js";
export { defineRating, GlRating } from "./components/rating/define.js";
export { defineSearchInput, GlSearchInput } from "./components/search-input/define.js";
export { defineTagInput, GlTagInput } from "./components/tag-input/define.js";
export { defineForm, GlForm } from "./components/form/define.js";
export { defineCommandPalette, GlCommandPalette, GlCommandItem, GlCommandGroup } from "./components/command-palette/define.js";
export { defineContainer, GlContainer } from "./components/container/define.js";
export { defineDrawer, GlDrawer } from "./components/drawer/define.js";
export { defineMenu, GlMenu, GlMenuItem, GlMenuSeparator, GlMenuLabel } from "./components/menu/define.js";
export { defineSplitPane, GlSplitPane } from "./components/split-pane/define.js";
export { defineStack, GlStack } from "./components/stack/define.js";
export { defineStepper, GlStepper, GlStepperStep } from "./components/stepper/define.js";

export function defineGlint(): void {
  defineAccordion();
  defineAlert();
  defineAvatar();
  defineBadge();
  defineButton();
  defineCard();
  defineCheckbox();
  defineCodeblock();
  defineBreadcrumb();
  defineDivider();
  defineLink();
  defineDropdown();
  defineInput();
  defineModal();
  defineNavbar();
  definePagination();
  definePopover();
  defineProgress();
  defineRadio();
  defineSelect();
  defineSidebar();
  defineSkeleton();
  defineSlider();
  defineSpinner();
  defineSwitch();
  defineTable();
  defineTextarea();
  defineTabs();
  defineToast();
  defineTooltip();
  defineTopbar();
  defineDatePicker();
  defineTimePicker();
  defineColorPicker();
  defineFileUpload();
  defineRating();
  defineSearchInput();
  defineTagInput();
  defineForm();
  defineCommandPalette();
  defineContainer();
  defineDrawer();
  defineMenu();
  defineSplitPane();
  defineStack();
  defineStepper();
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
