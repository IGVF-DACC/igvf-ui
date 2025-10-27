import { HTMLAttributes, ReactNode } from "react";

/**
 * Mock framer-motion to make animations instant in tests. We need this because facet tests check
 * for elements appearing/disappearing immediately after user actions, but real framer-motion
 * animations take time.
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
