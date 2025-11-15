import { HTMLAttributes, ReactNode } from "react";

/**
 * Mock motion/react to make animations instant in tests. We need this because facet tests check
 * for elements appearing/disappearing immediately after user actions, but real motion animations
 * take time.
 */

type AnimatePresenceProps = {
  children: ReactNode;
};

export const AnimatePresence = jest.fn(
  ({ children }: AnimatePresenceProps) => children
);

export const motion = {
  div: jest.fn((props: HTMLAttributes<HTMLDivElement>) => <div {...props} />),
  ul: jest.fn((props: HTMLAttributes<HTMLUListElement>) => <ul {...props} />),
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
