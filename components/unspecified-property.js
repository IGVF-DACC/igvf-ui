// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import SeparatedList from "./separated-list";
// lib
import { stringsToStringsWithCounts } from "../lib/arrays";
import { truncateJson } from "../lib/general";

/**
 * Display a property of an item as a JSON string, truncated to a certain number of characters.
 */
function JsonDisplay({ property }) {
  return (
    <div className="break-all font-mono text-sm">{truncateJson(property)}</div>
  );
}

JsonDisplay.propTypes = {
  // Property to display as a truncated JSON value
  property: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
};

/**
 * Generate a displayable form of the given property, whether a simple type, an object, or an
 * array, without the benefit of a schema to help us determine how to display that property.
 * Objects and arrays of objects with `@id` properties display as linked `@id` values, while arrays
 * of simple types display as a comma-separated list of the values. In more complex cases, the
 * property gets displayed as a JSON string, truncated to 200 characters.
 */
export default function UnspecifiedProperty({ property }) {
  if (typeof property === "string" || typeof property === "number") {
    return <div>{property}</div>;
  }
  if (typeof property === "boolean") {
    return <div>{property ? "true" : "false"}</div>;
  }

  // Else the property is an object or an array, after PropTypes gatekeeping.
  if (Array.isArray(property)) {
    if (property.length > 0) {
      if (typeof property[0] === "object") {
        if (property[0]["@id"]) {
          // Array of objects with @ids. Filter out objects with duplicate @ids.
          const itemIds = property.map((item) => item["@id"]);
          const uniqueItemIds = [...new Set(itemIds)];
          const uniqueProperties = uniqueItemIds.map((itemId) =>
            property.find((item) => item["@id"] === itemId)
          );

          return (
            <SeparatedList>
              {uniqueProperties.map((item) => (
                <Link key={item["@id"]} href={item["@id"]}>
                  {item["@id"]}
                </Link>
              ))}
            </SeparatedList>
          );
        }

        // Array of objects without @ids; display it as JSON.
        return <JsonDisplay property={property} />;
      }

      // Array of simple types; join them with commas.
      const uniqueStrings = stringsToStringsWithCounts(property);
      return <div>{uniqueStrings.join(", ")}</div>;
    }
  }

  // For embedded object properties with an @id, display the linked @id.
  if (property["@id"]) {
    return <Link href={property["@id"]}>{property["@id"]}</Link>;
  }

  // The embedded property is an object without an @id. Display it as JSON.
  return <JsonDisplay property={property} />;
}

UnspecifiedProperty.propTypes = {
  // Property to display in as good a form as possible
  property: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
    PropTypes.object,
    PropTypes.array,
  ]).isRequired,
};
