// node_modules
import type { Transition, Variants } from "motion/react";

/**
 * Motion animation variants and transition for height=0 to height=auto animations.
 */
export const standardAnimationTransition: Transition = {
  duration: 0.2,
  ease: "easeInOut",
};

export const standardAnimationVariants: Variants = {
  open: {
    height: "auto",
  },
  collapsed: {
    height: 0,
  },
};
