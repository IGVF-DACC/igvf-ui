// node_modules
import { createContext, ReactNode, useContext } from "react";
import { twMerge } from "tailwind-merge";

/**
 * `<RadioCardGroup>` needs to pass data to its child `<Card>` components so that they can function
 * as a group of radio buttons with a single selected value. This context defines the shape of that
 * data and the functions for updating the selected value when a card is clicked.
 *
 * @property name - `name` attribute for the radio buttons, ensuring only one card gets selected
 * @property selectedValue - Currently selected value in the group
 * @property setSelectedValue - Function to update the selected value when the user clicks a card
 */
type RadioCardGroupContext = {
  name: string;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
};

/**
 * Context for sharing state between `<RadioCardGroup>` and its child `<Card>` components.
 *
 */
const RadioContext = createContext<RadioCardGroupContext | null>(null);

/**
 * Container component that groups multiple `<Card>` components together, allowing only one card to
 * be selected at a time. Use `name` uniquely on the page to ensure proper radio button behavior.
 * The parent component manages the selected state by providing its current value and a function to
 * update it when a card is clicked.
 *
 * `legend` describes the group of options and can be visually hidden with `hideLegend`, though it
 * has to be provided for accessibility reasons. Even if you hide it, make sure it would sound
 * correct when read by a screen reader.
 *
 * The `className` prop can be used to add additional styling to the fieldset that wraps the entire
 * group including the legend. You can use the `data-cards` attribute in the Tailwind CSS classes
 * to target the div that wraps the cards, which is useful for styling the layout of the cards.
 *
 * @param name - `name` attribute for this radio button group; must be unique on the page
 * @param legend - Legend text for the fieldset, describing the group of options
 * @param hideLegend - True to hide the legend visually but keep it accessible to screen readers
 * @param selectedValue - Currently selected value in the group, determines which card is selected
 * @param setSelectedValue - Function to update the selected value when the user clicks a card
 * @param className - Optional additional CSS classes for styling the fieldset
 * @param children - The `<Card>` components that belong to this group
 */
export function RadioCardGroup({
  name,
  legend,
  hideLegend = false,
  selectedValue,
  setSelectedValue,
  className = "",
  children,
}: {
  name: string;
  legend: ReactNode;
  hideLegend?: boolean;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={twMerge("@container", className)}>
      <legend
        data-legend
        data-testid="data-legend"
        className={`text-lg font-bold ${hideLegend ? "sr-only" : ""}`}
      >
        {legend}
      </legend>
      <RadioContext.Provider value={{ selectedValue, setSelectedValue, name }}>
        <div
          data-cards
          className="grid grid-cols-1 gap-2 @lg:grid-cols-2 @4xl:grid-cols-3"
        >
          {children}
        </div>
      </RadioContext.Provider>
    </fieldset>
  );
}

/**
 * `<RadioCardGroup.Card>` defines an individual card within `<RadioCardGroup>`. It renders a
 * clickable card that behaves like a radio button, allowing users to select one option from a
 * group of cards. Each card contains a radio button with a label next to it, like any radio button.
 * Below that is a description that provides additional information about the option.
 *
 * This component is exported so Jest tests can import it directly for coverage. In app code,
 * prefer <RadioCardGroup.Card> inside <RadioCardGroup>.
 *
 * @param id - Unique ID for the card; must be unique within the group
 * @param value - Value associated with the card's radio button; identifies this button on click
 * @param label - Label displayed next to the radio button
 * @param description - Additional information about the option, displayed below the label
 * @param disabled - True to disable the card and its radio button, preventing user interaction
 */
export function Card({
  id,
  value,
  label,
  description,
  disabled,
  className = "",
}: {
  id: string;
  value: string;
  label: ReactNode;
  description: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error("Card must be used within a RadioCardGroup");
  }
  const { selectedValue, setSelectedValue, name } = context;

  // Allow each card ID to be unique within the group but still usable in other radio card groups
  // on the page.
  const inputId = `${name}-${id}`;

  return (
    <label
      htmlFor={inputId}
      className={twMerge(
        `border-radio-card-outline has-checked:border-radio-card-outline-checked block rounded-lg border px-4 py-2 ${disabled ? "cursor-default opacity-50" : "cursor-pointer"}`,
        className
      )}
    >
      <div className="my-2 flex gap-2">
        <input
          type="radio"
          id={inputId}
          name={name}
          value={value}
          disabled={disabled}
          checked={selectedValue === value}
          className="accent-radio-card-button size-5 shrink-0"
          onChange={() => {
            setSelectedValue(value);
          }}
        />
        <div className="grow">
          <div className="mb-2 text-base/5 font-bold">{label}</div>
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </label>
  );
}

RadioCardGroup.Card = Card;
