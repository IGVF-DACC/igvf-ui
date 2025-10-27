/**
 * Tailwind CSS classes common to all buttons; both <Button> and <ButtonLink> types.
 */
const commonButtonClasses =
  "items-center justify-center border font-semibold leading-none";

/**
 * Tailwind CSS classes for each of the icon sizes.
 */
const iconSizes = {
  sm: "[&>svg]:h-3 [&>svg]:w-3",
  md: "[&>svg]:h-4 [&>svg]:w-4",
  lg: "[&>svg]:h-5 [&>svg]:w-5",
};

/**
 * Tailwind CSS classes for each of the button sizes.
 */
const buttonSizeClasses = {
  sm: `px-2 rounded-sm text-xs h-6 ${iconSizes.sm}`,
  md: `px-4 rounded-sm text-sm h-8 ${iconSizes.md}`,
  lg: `px-6 rounded-sm text-base h-10 ${iconSizes.lg}`,
};

/**
 * Tailwind CSS classes for each of the icon-only button sizes.
 */
const iconButtonSizeClasses = {
  sm: `px-1.5 rounded-sm form-element-height-sm ${iconSizes.sm}`,
  md: `px-2 rounded-sm form-element-height-md ${iconSizes.md}`,
  lg: `px-3 rounded-sm form-element-height-lg ${iconSizes.lg}`,
};

/**
 * Tailwind CSS classes for each of the icon-only circular button sizes.
 */
const iconCircleButtonSizeClasses = {
  sm: `px-[5px] rounded-full ${iconSizes.sm}`,
  md: `p-2 rounded-full ${iconSizes.md}`,
  lg: `p-3 rounded-full ${iconSizes.lg}`,
};

/**
 * Background colors for each of the button types.
 */
const buttonTypeClasses = {
  primary:
    "bg-button-primary border-button-primary text-button-primary fill-button-primary disabled:bg-button-primary-disabled disabled:border-button-primary-disabled disabled:text-button-primary-disabled disabled:fill-button-primary-disabled",
  secondary:
    "bg-button-secondary border-button-secondary text-button-secondary fill-button-secondary disabled:bg-button-secondary-disabled disabled:border-button-secondary-disabled disabled:text-button-secondary-disabled disabled:fill-button-secondary-disabled",
  warning:
    "bg-button-warning border-button-warning text-button-warning fill-button-warning disabled:bg-button-warning-disabled disabled:border-button-warning-disabled disabled:text-button-warning-disabled disabled:fill-button-warning-disabled",
  selected:
    "bg-button-selected border-button-selected text-button-selected fill-button-selected disabled:bg-button-selected-disabled disabled:border-button-selected-disabled disabled:text-button-selected-disabled disabled:fill-button-selected-disabled",
  primaryDisabled:
    "bg-button-primary-disabled border-button-primary-disabled text-button-primary-disabled fill-button-primary-disabled",
  secondaryDisabled:
    "bg-button-secondary-disabled border-button-secondary-disabled text-button-secondary-disabled fill-button-secondary-disabled",
  warningDisabled:
    "bg-button-warning-disabled border-button-warning-disabled text-button-warning-disabled fill-button-warning-disabled",
};

/**
 * All possible button sizes.
 */
export type ButtonSizes = keyof typeof buttonSizeClasses;

/**
 * All possible button types.
 */
export type ButtonTypes = keyof typeof buttonTypeClasses;

/**
 * Generate the Tailwind CSS classes for the button size depending on the button size and options.
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} hasIconOnly - True for buttons containing only an icon
 * @param {boolean} hasIconCircleOnly - True for circular buttons containing only an icon
 * @returns {string} - Tailwind CSS classes for the button size
 */
function generateButtonSizeClasses(
  size: ButtonSizes,
  hasIconOnly: boolean,
  hasIconCircleOnly: boolean
): string {
  if (hasIconOnly) {
    return iconButtonSizeClasses[size];
  }
  if (hasIconCircleOnly) {
    return iconCircleButtonSizeClasses[size];
  }
  return buttonSizeClasses[size];
}

/**
 * Generate the Tailwind CSS classes for the button type, size, and options.
 * @param type - Type of button; mostly used for styling
 * @returns Tailwind CSS classes for the button type
 */
function generateButtonTypeClasses(type: ButtonTypes): string {
  return buttonTypeClasses[type];
}

/**
 * Generate the Tailwind CSS classes for the button type, size, and options.
 * @param type - Button type; mostly used for styling
 * @param size - Button size (sm, md, lg)
 * @param hasIconOnly - True for buttons containing only an icon
 * @param hasIconCircleOnly - True for circular buttons containing only an icon
 * @returns Tailwind CSS classes for the button
 */
export function generateButtonClasses(
  type: ButtonTypes = "primary",
  size: ButtonSizes = "md",
  hasIconOnly: boolean = false,
  hasIconCircleOnly: boolean = false
): string {
  return `${commonButtonClasses} ${generateButtonSizeClasses(
    size,
    hasIconOnly,
    hasIconCircleOnly
  )} ${generateButtonTypeClasses(type)}`;
}
