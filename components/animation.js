/**
 * Framer Motion animation variants and transition for height=0 to height=auto animations.
 */
export const standardAnimationTransition = { duration: 0.2, ease: "easeInOut" };
export const standardAnimationVariants = {
  open: { height: "auto" },
  collapsed: { height: 0 },
};
