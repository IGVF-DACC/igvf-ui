import { colorToTriple, isLight } from "../color";

describe("Test colorToTriple()", () => {
  it("converts a hex color to an object with r, g, and b components", () => {
    const { r, g, b } = colorToTriple("#ff0000");
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });
});

describe("Test isLight()", () => {
  it("returns true for a light color", () => {
    expect(isLight("#ffffff")).toBe(true);
  });

  it("returns false for a dark color", () => {
    expect(isLight("#000000")).toBe(false);
  });
});

describe("Test colorVariableToColorHex()", () => {
  let currentFillStyle = "";
  let mockCtx: any;
  let colorVariableToColorHex: any;

  beforeEach(async () => {
    // Reset jest module registry to clear the module-level cache
    jest.resetModules();

    // Reset state
    currentFillStyle = "";

    // Store the original createElement to avoid infinite recursion
    const originalCreateElement = document.createElement.bind(document);

    // Mock canvas getContext to return a mock 2D context
    const mockGetImageData = jest.fn();
    const mockClearRect = jest.fn();
    const mockFillRect = jest.fn();

    mockCtx = {
      clearRect: mockClearRect,
      fillRect: mockFillRect,
      getImageData: mockGetImageData,
    };

    // Use Object.defineProperty to create getter/setter for fillStyle
    Object.defineProperty(mockCtx, "fillStyle", {
      get() {
        return currentFillStyle;
      },
      set(value: string) {
        currentFillStyle = value;
      },
      configurable: true,
    });

    jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        if (tagName === "canvas") {
          const canvas = originalCreateElement("canvas");
          canvas.getContext = jest.fn().mockReturnValue(mockCtx);
          canvas.width = 1;
          canvas.height = 1;
          return canvas;
        }
        if (tagName === "div") {
          const div = originalCreateElement("div");
          let capturedColor = "";

          // Override the style property to capture color values before jsdom strips them
          Object.defineProperty(div, "style", {
            get() {
              return {
                get color() {
                  return capturedColor;
                },
                set color(value: string) {
                  capturedColor = value;
                },
              };
            },
            configurable: true,
          });

          return div;
        }
        return originalCreateElement(tagName);
      });

    // Mock getImageData to return RGBA values based on fillStyle
    mockGetImageData.mockImplementation(() => {
      const fillStyle = currentFillStyle;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 255;

      // Parse rgb() or rgba() values
      if (typeof fillStyle === "string") {
        const rgbMatch = fillStyle.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
        );
        if (rgbMatch) {
          r = parseInt(rgbMatch[1]);
          g = parseInt(rgbMatch[2]);
          b = parseInt(rgbMatch[3]);
          a = rgbMatch[4] ? Math.round(parseFloat(rgbMatch[4]) * 255) : 255;
        }
      }

      return {
        data: new Uint8ClampedArray([r, g, b, a]),
      };
    });

    // Mock getComputedStyle to return predictable color values
    jest.spyOn(window, "getComputedStyle").mockImplementation((element) => {
      const color = (element as HTMLElement).style.color;

      // Map CSS variables to their resolved color values
      if (color === "var(--test-color-red)") {
        return { color: "rgb(255, 0, 0)" } as CSSStyleDeclaration;
      }
      if (color === "var(--test-color-blue)") {
        return { color: "rgb(0, 0, 255)" } as CSSStyleDeclaration;
      }
      if (color === "var(--test-color-transparent)") {
        return { color: "rgba(128, 128, 128, 0.5)" } as CSSStyleDeclaration;
      }
      return { color: "" } as CSSStyleDeclaration;
    });

    // Import the function after mocks are set up
    const colorModule = await import("../color");
    colorVariableToColorHex = colorModule.colorVariableToColorHex;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("converts a CSS color variable to hex color", () => {
    const hex = colorVariableToColorHex("var(--test-color-red)");
    expect(hex).toBe("#ff0000");
  });

  it("returns cached hex color on second call", () => {
    const spy = jest.spyOn(window, "getComputedStyle");

    // First call - should call getComputedStyle
    const hex1 = colorVariableToColorHex("var(--test-color-blue)");
    expect(hex1).toBe("#0000ff");
    const firstCallCount = spy.mock.calls.length;

    // Second call - should use cache, not call getComputedStyle again
    const hex2 = colorVariableToColorHex("var(--test-color-blue)");
    expect(hex2).toBe("#0000ff");
    const secondCallCount = spy.mock.calls.length;

    // Verify cache was used (no additional getComputedStyle calls)
    expect(secondCallCount).toBe(firstCallCount);
  });

  it("includes alpha channel in hex when alpha < 255", () => {
    const hex = colorVariableToColorHex("var(--test-color-transparent)");
    // rgba(128, 128, 128, 0.5) -> #80808080 (0.5 * 255 = 127.5 -> 128 = 0x80)
    expect(hex).toMatch(/^#[0-9a-f]{8}$/);
    expect(hex.startsWith("#808080")).toBe(true);
  });

  it("omits alpha channel in hex when alpha = 255", () => {
    const hex = colorVariableToColorHex("var(--test-color-red)");
    // rgb(255, 0, 0) with implicit alpha=255 -> #ff0000
    expect(hex).toBe("#ff0000");
    expect(hex.length).toBe(7); // 6 hex digits + #
  });
});

it("throws error when canvas context is not available", async () => {
  await jest.isolateModulesAsync(async () => {
    const { HTMLCanvasElement } = window;

    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(null);

    jest.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "rgb(255, 0, 0)",
    } as CSSStyleDeclaration);

    const colorModule = await import("../color");

    expect(() => {
      colorModule.colorVariableToColorHex("var(--test-color)");
    }).toThrow("2D canvas not available");

    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });
});
