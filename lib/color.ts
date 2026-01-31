interface Color {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert a CSS hex color to an object with the equivalent r, g, and b components as integers from
 * 0 to 255.
 * @param {string} color CSS hex color to convert
 * @return {Color} rgb
 * @return {Color.r} Red component as an integer from 0 to 255
 * @return {Color.g} Green component as an integer from 0 to 255
 * @return {Color.b} Blue component as an integer from 0 to 255
 */
export function colorToTriple(color: string): Color {
  const num = parseInt(color.slice(1), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00ff;
  const b = num & 0x0000ff;
  return { r, g, b };
}

/**
 * Test whether a color is light or not. If it's light, then using it as a background for text makes
 * black text most readable. If it's not light, then white text would work better. This function
 * calculates luminance, so blue is considered darker than red, which is considered darker than
 * green.
 * @param {string} color CSS hex color to test
 * @return {boolean} True if `color` is a "light" color.
 */
export function isLight(color: string): boolean {
  const { r, g, b } = colorToTriple(color);

  // YIQ equation from http://24ways.org/2010/calculating-color-contrast
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 180;
}

/**
 * Convert a CSS color variable (like "var(--color-for-tailwind)") to a resolved color value.
 * Depending on how the CSS variable is defined, the resolved color value might be a hex color, an
 * rgb color (like "rgb(255, 0, 0)"), an oklch color (like "oklch(65% 0.1 120)") or potentially
 * others depending on the definition of the color variable in the Tailwind CSS config.
 *
 * @param colorVar - Color variable string, like "var(--color-for-tailwind)"
 * @returns Resolved color value for the input color variable
 */
function colorVariableToColorValue(colorVar: string): string {
  // Add a temporary element to the document and set its color to the input color variable.
  const el = document.createElement("div");
  el.style.color = colorVar;
  document.body.appendChild(el);

  // Get the resolved color value of the element, and then remove the temporary element.
  const colorValue = getComputedStyle(el).color;
  document.body.removeChild(el);
  return colorValue;
}

/**
 * Cache for color variables to their corresponding hex colors. This avoids the overhead of
 * creating a canvas for every color conversion.
 */
const colorToHexCache = new Map<string, string>();

/**
 * Canvas to reuse for every color conversion. This avoids the overhead of creating a canvas for every
 * color conversion.
 */
let moduleCtx: CanvasRenderingContext2D | null = null;

/**
 * Get a canvas context to use for color conversion. This function creates a canvas and its 2D
 * rendering context on the first call and then reuses the same context on subsequent calls.
 *
 * @returns Canvas context instance to use for color conversion
 */
function getCanvasCtx(): CanvasRenderingContext2D {
  if (!moduleCtx) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;

    moduleCtx = canvas.getContext("2d", { willReadFrequently: true });
    if (!moduleCtx) {
      throw new Error("2D canvas not available");
    }
  }

  return moduleCtx;
}

/**
 * Convert a CSS color variable like "var(--color-for-tailwind)" to an equivalent hex color. This
 * is useful for converting Tailwind CSS variables to hex colors that can be used in the file graph
 * download. Depending on how the CSS variable is defined, the equivalent hex color might not be
 * exactly the same as the resolved color value for the variable (for example, if the variable is
 * defined as an oklch color), but it will be a close approximation that can be used for download
 * purposes.
 *
 * @param colorVariable - Color variable in the form `var(--color-something)`
 * @returns Equivalent hex color
 */
export function colorVariableToColorHex(colorVariable: string): string {
  // Use the cached hex corresponding to the input color variable for cache hits.
  const cachedHex = colorToHexCache.get(colorVariable);
  if (cachedHex) {
    return cachedHex;
  }

  // Convert the input color variable to a resolved color value in whatever format the Tailwind CSS
  // variable is defined in.
  const colorValue = colorVariableToColorValue(colorVariable);

  // Fill the canvas pixel with the fill color.
  const ctx = getCanvasCtx();
  ctx.fillStyle = colorValue;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);

  // Get the color of the filled pixel, which will be in rgba format.
  const { data } = ctx.getImageData(0, 0, 1, 1);
  const r = data[0];
  const g = data[1];
  const b = data[2];
  const a = data[3];

  // Convert the rgba color to a hex color. If the alpha value is less than 255, include it in the hex
  // color as a 2-digit hex value at the end. If the alpha value is 255, then we can just return the
  // hex color for the r, g, and b values.
  const hex =
    a !== 255
      ? `#${[r, g, b, a].map((x) => x.toString(16).padStart(2, "0")).join("")}`
      : `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;

  // Cache the hex corresponding to the input color variable for future cache hits.
  colorToHexCache.set(colorVariable, hex);
  return hex;
}
