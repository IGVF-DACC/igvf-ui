// node_modules
import PropTypes from "prop-types";

/**
 * Displays the standard facet title, using the `title` property of the displayed facet.
 */
export default function StandardTitle({ facet }) {
  return (
    <h2
      className="mb-1 bg-facet-title text-center text-base font-medium text-facet-title"
      data-testid={`facettitle-${facet.field}`}
    >
      {facet.title}
    </h2>
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
};
