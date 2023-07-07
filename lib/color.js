/**
 * Convert a CSS hex color to an object with the equivalent r, g, and b components as integers from
 * 0 to 255.
 * @param {string} color CSS hex color to convert
 * @return {object} rgb
 * @return {object.r} Red component as an integer from 0 to 255
 * @return {object.g} Green component as an integer from 0 to 255
 * @return {object.b} Blue component as an integer from 0 to 255
 */
export function colorToTriple(color) {
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
 * @return {bool} True if `color` is a "light" color.
 */
export function isLight(color) {
  const { r, g, b } = colorToTriple(color);

  // YIQ equation from http://24ways.org/2010/calculating-color-contrast
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 180;
}
