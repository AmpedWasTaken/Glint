import { define } from "../../internal/define.js";

import { GlFileUpload } from "./file-upload.js";

export function defineFileUpload(): void {
  define(GlFileUpload.tagName, GlFileUpload);
}

export { GlFileUpload };

