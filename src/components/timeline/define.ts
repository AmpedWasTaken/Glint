import { define } from "../../internal/define.js";

import { GlTimeline, GlTimelineItem } from "./timeline.js";

export function defineTimeline() {
  define(GlTimeline.tagName, GlTimeline);
  define(GlTimelineItem.tagName, GlTimelineItem);
}

export { GlTimeline, GlTimelineItem };

