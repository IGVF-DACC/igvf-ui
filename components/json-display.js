// node_modules
import PropTypes from "prop-types";
// components
import { DataPanel } from "./data-area";
import ObjectPageHeader from "./object-page-header";

/**
 * This function will display a raw JSON view for a given object if the query is in JSON format, otherwise it will display an object view.
 * @param {*} item the object to display
 * @param {*} isJsonFormat the bool value to check if the view should be raw JSON
 * @param {*} children the children components to display
 * @returns either a raw JSON view or a object view
 */
export default function JsonDisplay({ item, isJsonFormat, children }) {
  return (
    <>
      <ObjectPageHeader item={item} isJsonFormat={isJsonFormat} />
      {isJsonFormat ? (
        <DataPanel>
          <div className="border border-gray-300 bg-gray-100 text-xs dark:border-gray-800 dark:bg-gray-900">
            <pre className="overflow-x-scroll p-1">
              {JSON.stringify(item, null, 4)}
            </pre>
          </div>
        </DataPanel>
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
