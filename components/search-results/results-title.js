// node_modules
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import {
  DataItemValueCollapseControl,
  DataItemValueControlLabel,
  useDataAreaCollapser,
} from "../data-area";
import SeparatedList from "../separated-list";

/**
 * Displays the title of a search-results page. This is a list of all the types of search results
 * that appear on the page. Only the first three display initially, but a button lets the user
 * expand that list to the full set of types.
 */
export default function ResultsTitle({ types }) {
  const typesCollapser = useDataAreaCollapser(types);
  return (
    <SeparatedList>
      {typesCollapser.displayedData.map((type, index) => (
        <Fragment key={type}>
          {type}
          {index === typesCollapser.displayedData.length - 1 && (
            <DataItemValueCollapseControl
              key="more-control"
              collapser={typesCollapser}
              className="ml-1 inline-block"
            >
              <DataItemValueControlLabel collapser={typesCollapser} />
            </DataItemValueCollapseControl>
          )}
        </Fragment>
      ))}
    </SeparatedList>
  );
}

ResultsTitle.propTypes = {
  // All search-result object types to display in the title
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
};
