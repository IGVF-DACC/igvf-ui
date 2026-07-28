import { HTMLAttributes, ReactElement } from "react";

/**
 * Mock motion/react to make animations instant in tests. We need this because facet tests check
 * for elements appearing/disappearing immediately after user actions, but real motion animations
 * take time.
 */

type AnimatePresenceProps = {
  children: ReactElement | ReactElement[] | null;
};

export const AnimatePresence = jest.fn(
  ({ children }: AnimatePresenceProps) => children
);

type MotionDivProps = HTMLAttributes<HTMLDivElement> & {
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  variants?: unknown;
  transition?: unknown;
};

type MotionUlProps = HTMLAttributes<HTMLUListElement> & {
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  variants?: unknown;
  transition?: unknown;
};

export const motion = {
  div: jest.fn(
    ({
      initial: _initial,
      animate: _animate,
      exit: _exit,
      variants: _variants,
      transition: _transition,
      ...props
    }: MotionDivProps) => <div {...props} />
  ),
  ul: jest.fn(
    ({
      initial: _initial,
      animate: _animate,
      exit: _exit,
      variants: _variants,
      transition: _transition,
      ...props
    }: MotionUlProps) => <ul {...props} />
  ),
};

export const Reorder = {
  Group: jest.fn(
    ({ children, onReorder, values: _values, axis: _axis, ...props }: any) => (
      <div {...props} data-onreorder={onReorder ? "true" : "false"}>
        {children}
      </div>
    )
  ),
  Item: jest.fn(
    ({
      children,
      value: _value,
      whileDrag: _whileDrag,
      dragListener: _dragListener,
      dragControls: _dragControls,
      ...props
    }: any) => <div {...props}>{children}</div>
  ),
};
