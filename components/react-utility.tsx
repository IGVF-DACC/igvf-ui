import { useEffect, useLayoutEffect } from "react";

/**
 * A hook that behaves like `useLayoutEffect` on the client and `useEffect` on the server.
 * This is useful for avoiding warnings about using `useLayoutEffect` on the server.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
