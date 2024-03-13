// node_modules
import PropTypes from "prop-types";
// components
import JsonPanel from "./json-panel";
// lib
import { sortObjectProps } from "../lib/general";

/**
 * This function will display a raw JSON view for a given object if the query is in JSON format, otherwise it will display an object view.
 * @param {*} item the object to display
 * @param {*} isJsonFormat the bool value to check if the view should be raw JSON
 * @param {*} children the children components to display
 * @returns either a raw JSON view or a object view
 */
export default function JsonDisplay({ item, isJsonFormat, children }) {
  const sortedItem = sortObjectProps(item);

  return (
    <>
      {isJsonFormat ? (
        <JsonPanel>{JSON.stringify(sortedItem, null, 4)}</JsonPanel>
      ) : (
        <>{children}</>
      )}
    </>
  );
}

JsonDisplay.propTypes = {
  item: PropTypes.object.isRequired,
  isJsonFormat: PropTypes.bool.isRequired,
};
