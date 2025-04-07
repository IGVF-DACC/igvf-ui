// node_modules
import { useEffect, useRef } from "react";

/**
 * This component creates a range selector with two range inputs (min and max) and a container
 * element that holds the range inputs as well as a dynamically updating legend. This combines two
 * built-in range inputs, one to allow the user to set the minimum value of the range and one to
 * set the maximum value. The right edge of the minimum range input is aligned with the left edge
 * of the maximum range input. This split point changes position as the user drags the range inputs
 * to the average of the two values. So as the user drags the minimum range input to the right, the
 * maximum range input left end moves to the right as well.
 *
 * With the range minimums and maximums set to 0 and 100 (assuming those are the minimum and
 * maximum values), the split point will be at the average, 50, meaning the right end of the
 * minimum range input will be at 50 and the left end of the maximum range input will also be at 50.
 * O--------------|----------------0
 *
 * As the user moves the maximum range input to the left, the split point moves to the left as
 * well. The minimum range input gets narrower and the maximum range input gets wider.
 * O----------|-----------O---------
 *
 * Moving the minimum range input to the right moves the split point to the right, making the
 * minimum range input wider and the maximum range input narrower.
 * -------------O----|----O---------
 *
 * Adapted from:
 * https://codepen.io/joosts/pen/rNLdxvK
 */

/**
 * The size of the range input thumb in pixels. This is used to calculate the width of the range
 * inputs and their positions.
 */
const THUMB_SIZE = 14;

/**
 * This object provides a convenient way to pass the container and range input DOM elements to the
 * functions to updateValue the data-value attributes and render the range selectors and legend.
 */
type RangeSelectorProps = {
  /** Container DOM element; contains range inputs and legend */
  container: HTMLElement;
  /** Range DOM element for the minimum value of the range */
  min: HTMLInputElement;
  /** Range DOM element for the maximum value of the range */
  max: HTMLInputElement;
};

/**
 * Called to update the visual representation of the range selector. It updates the widths and
 * positions of the minimum and maximum range inputs based on the split value.
 * @param props - References the container and the min and max DOM elements
 * @returns The updated min and max values for the change callback
 */
function update({ container, min, max }: RangeSelectorProps): {
  minValue: number;
  maxValue: number;
} {
  // Get the split value by averaging the min and max range input values.
  const minValue = Number(min.value);
  const maxValue = Number(max.value);
  const average = (minValue + maxValue) / 2;

  // Get the container width and the min and max range input values from its data attributes.
  const rangeWidth = Number(container.getAttribute("data-width"));
  const rangeMin = Number(container.getAttribute("data-min"));
  const rangeMax = Number(container.getAttribute("data-max"));

  // Update the minimum range input's max attribute and the maximum range input's min attribute to
  // the split value.
  const domSplitValue = Math.floor(average).toString();
  min.setAttribute("max", domSplitValue);
  max.setAttribute("min", domSplitValue);

  // Set the widths of the minimum and maximum range inputs based on the split value.
  const realWidth = rangeWidth - 2 * THUMB_SIZE;
  const range = rangeMax - rangeMin;
  const minWidth = Math.floor(
    THUMB_SIZE + ((average - rangeMin) / range) * realWidth
  );
  const maxWidth = Math.floor(
    THUMB_SIZE + ((rangeMax - average) / range) * realWidth
  );

  // Set the inline styles for the minimum and maximum range inputs so that the left end of the
  // maximum range input is at the right end of the minimum range input, appearing as if it were
  // one range control with two thumbs.
  min.style.width = minWidth > 0 ? `${minWidth}px` : "50%";
  max.style.width = maxWidth > 0 ? `${maxWidth}px` : "50%";
  min.style.left = "0px";
  max.style.left = minWidth > 0 ? `${minWidth}px` : "50%";

  // Return the updated min and max values for the change callback.
  return { minValue, maxValue };
}

/**
 * Component to display a range selector allowing the user to select a range of values with a
 * minimum and maximum value.
 * @param id - The id of the range selector, unique within the page.
 * @param minValue - The minimum value of the range selector.
 * @param maxValue - The maximum value of the range selector.
 * @param step - The step value for the range inputs.
 */
export function RangeSelector({
  id,
  minValue,
  maxValue,
  minRangeValue = minValue,
  maxRangeValue = maxValue,
  step = 1,
  onChange,
  isDisabled = false,
}: {
  id: string;
  minValue: number;
  maxValue: number;
  minRangeValue?: number;
  maxRangeValue?: number;
  step?: number;
  onChange: (min: number, max: number) => void;
  isDisabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  function onChangeMinValue(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    onChange(value, maxValue);
  }

  function onChangeMaxValue(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    onChange(minValue, value);
  }

  useEffect(() => {
    const container = containerRef.current;
    const min = minRef.current;
    const max = maxRef.current;
    const props: RangeSelectorProps = {
      container: containerRef.current,
      min: minRef.current,
      max: maxRef.current,
    };

    // Get the initial min and max values from the range input attributes.
    const rangeMinValue = min.getAttribute("min");
    const rangeMaxValue = max.getAttribute("max");

    // Set the initial data-min and data-max attributes for the container.
    container.setAttribute("data-min", rangeMinValue);
    container.setAttribute("data-max", rangeMaxValue);
    container.setAttribute("data-width", container.offsetWidth.toString());

    // The range-selector elements have their attributes set, so update the styles and
    // attributes of the range inputs and the container.
    update(props);

    // Wrapper function for `updateValue()` to pass the proper function type to
    // `addEventListener()`. Pass the updated minimum and maximum values to the onChange callback.
    function updateListener() {
      update(props);
    }

    // Add event listeners to the min and max range inputs to update the attributes and styles of
    // the range inputs and the container.
    if (min && max) {
      min.addEventListener("input", updateListener);
      max.addEventListener("input", updateListener);
    }

    // Remove event listeners when the range selector is unmounted.
    return () => {
      if (min) {
        min.removeEventListener("input", updateListener);
      }
      if (max) {
        max.removeEventListener("input", updateListener);
      }
    };
  }, []);

  const minId = `min-${id}`;
  const maxId = `max-${id}`;
  return (
    <div
      id={id}
      ref={containerRef}
      className="relative h-[14px] w-full"
      data-range-selector
    >
      <label htmlFor={minId} className="hidden">
        Minimum
      </label>
      <input
        ref={minRef}
        id={minId}
        name="min-range-selector"
        type="range"
        step={step}
        min={minRangeValue}
        max={maxRangeValue}
        value={minValue}
        onChange={onChangeMinValue}
        className="absolute"
        disabled={isDisabled}
        aria-label="Range selector minimum value"
      />
      <label htmlFor={maxId} className="hidden">
        Maximum
      </label>
      <input
        ref={maxRef}
        id={maxId}
        name="max-range-selector"
        type="range"
        step={step}
        min={minRangeValue}
        max={maxRangeValue}
        value={maxValue}
        onChange={onChangeMaxValue}
        className="absolute"
        disabled={isDisabled}
        aria-label="Range selector maximum value"
      />
    </div>
  );
}
