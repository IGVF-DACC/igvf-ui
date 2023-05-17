// node_modules
import PropTypes from "prop-types";
// components
import { DataPanel } from "./data-area";
import ObjectPageHeader from "./object-page-header";

export function JsonDisplay({ item, isJsonFormat, children }) {
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
