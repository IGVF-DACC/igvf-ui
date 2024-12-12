// node_modules
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";

/**
 * Alternate facet title renderers can use this to display the standard title collapse/expand
 * button. That way you can keep the standard functionality and only change something about the
 * title itself.
 */
export function StandardTitleButton({
  field,
  updateOpen,
  isFacetOpen,
  children,
}) {
  return (
    <h2
      className="text-base font-normal text-facet-title"
      data-testid={`facettitle-${field}`}
    >
      <button
        className="flex w-full items-center justify-between"
        onClick={updateOpen}
      >
        <div className="text-left">{children}</div>
        <div className="basis-4">
          {isFacetOpen ? (
            <MinusIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </div>
      </button>
    </h2>
  );
}

StandardTitleButton.propTypes = {
  // Facet property name
  field: PropTypes.string.isRequired,
  // Function to call when the user clicks the open/collapse button
  updateOpen: PropTypes.func.isRequired,
  // True if the facet displays all its terms
  isFacetOpen: PropTypes.bool.isRequired,
};

/**
 * Displays the standard facet title, using the `title` property of the displayed facet.
 */
export default function StandardTitle({ facet, updateOpen, isFacetOpen }) {
  return (
    <StandardTitleButton
      field={facet.field}
      updateOpen={updateOpen}
      isFacetOpen={isFacetOpen}
    >
      {facet.title}
    </StandardTitleButton>
  );
}

StandardTitle.propTypes = {
  // Facet object to display the title for
  facet: PropTypes.shape({
    // Facet property name
    field: PropTypes.string.isRequired,
    // Facet title
    title: PropTypes.string.isRequired,
  }).isRequired,
  // Function to call when the user clicks the open/collapse button
  updateOpen: PropTypes.func.isRequired,
  // True if the facet displays all its terms
  isFacetOpen: PropTypes.bool.isRequired,
};
