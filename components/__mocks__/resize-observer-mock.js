/**
 * Needed to work around ResizeObserver not being available in JSDDOM. This mostly fixes
 * headlessui Jest test issues.
 */
global.ResizeObserver = class FakeResizeObserver {
  observe() {}
  disconnect() {}
};
