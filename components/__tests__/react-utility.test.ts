describe("useIsomorphicLayoutEffect", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("uses useLayoutEffect when window is available", async () => {
    jest.resetModules();

    const React = await import("react");
    const { useIsomorphicLayoutEffect } = await import("../react-utility");

    expect(useIsomorphicLayoutEffect).toBe(React.useLayoutEffect);
  });

  it("uses useEffect when window is unavailable", async () => {
    jest.resetModules();

    const hadWindow = Object.prototype.hasOwnProperty.call(
      globalThis,
      "window"
    );
    const originalWindow = (globalThis as { window?: Window }).window;

    try {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        writable: true,
        value: undefined,
      });

      const React = await import("react");
      const { useIsomorphicLayoutEffect } = await import("../react-utility");

      expect(useIsomorphicLayoutEffect).toBe(React.useEffect);
    } finally {
      if (hadWindow) {
        Object.defineProperty(globalThis, "window", {
          configurable: true,
          writable: true,
          value: originalWindow,
        });
      } else {
        delete (globalThis as { window?: Window }).window;
      }
    }
  });
});
