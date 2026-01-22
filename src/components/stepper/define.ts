import { define } from "../../internal/define.js";
import { GlStepper, GlStepperStep } from "./stepper.js";

export function defineStepper(): void {
  define(GlStepper.tagName, GlStepper);
  define(GlStepperStep.tagName, GlStepperStep);
}

export { GlStepper, GlStepperStep };

