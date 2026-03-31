const originalWindow = globalThis.window;

async function loadHookForWindowState(windowIsDefined: boolean) {
  jest.resetModules();
  Object.defineProperty(globalThis, "window", {
    value: windowIsDefined ? originalWindow : undefined,
    configurable: true,
    writable: true,
  });

  // Import the file under test at this point because its behavior depends on the state of
  // `window`. We need to do this after we set `window` to ensure we get the correct version of the
  // hook.
  const reactUtility = await import("../react-utility");
  const react = await import("react");
  return {
    hook: reactUtility.useIsomorphicLayoutEffect,
    useEffect: react.useEffect,
    useLayoutEffect: react.useLayoutEffect,
  };
}

afterEach(() => {
  Object.defineProperty(globalThis, "window", {
    value: originalWindow,
    configurable: true,
    writable: true,
  });
});

describe("useIsomorphicLayoutEffect", () => {
  it("should be defined", async () => {
    const { hook } = await loadHookForWindowState(true);
    expect(hook).toBeDefined();
  });

  it("should be useLayoutEffect on the client", async () => {
    const { hook, useLayoutEffect } = await loadHookForWindowState(true);
    expect(hook).toBe(useLayoutEffect);
  });

  it("should be useEffect on the server", async () => {
    const { hook, useEffect } = await loadHookForWindowState(false);
    expect(hook).toBe(useEffect);
  });
});
