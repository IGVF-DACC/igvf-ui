// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
// lib
import { isValidPath, isValidUrl } from "../lib/general";

/**
 * Display a property of an item as a JSON string.
 */
function JsonDisplay({ property }) {
  return <div className="font-mono text-sm break-all">{property}</div>;
}

JsonDisplay.propTypes = {
  // Property to display as JSON value
  property: PropTypes.string,
};

/**
 * Generate a displayable form of the given property, whether a simple type, an object, or an
 * array, without the benefit of a schema to help us determine how to display that property.
 * Objects and arrays of objects with `@id` properties display as linked `@id` values, while arrays
 * of simple types display as a comma-separated list of the values. In more complex cases, the
 * property gets displayed as a JSON string, truncated to 200 characters.
 */
export default function UnspecifiedProperty({ properties }) {
  const sortedProperties = _.sortBy(properties, (property) => {
    return property.toLowerCase();
  });

  return (
    <div>
      <SeparatedList>
        {sortedProperties.map((property, index) => {
          // If the string property starts and ends with curly braces, display it as a JSON string that breaks on any character
          if (property.match(/^\{.*\}$/)) {
            return <JsonDisplay key={index} property={property} />;
          }

          // If the property looks like a URL, display it as an external link
          if (isValidUrl(property)) {
            return (
              <a
                key={index}
                href={property}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all"
              >
                {property}
              </a>
            );
          }

          // If the property looks like path, display it as an internal link
          if (isValidPath(property)) {
            return (
              <Link key={index} href={property} className="break-all">
                {property}
              </Link>
            );
          }

          // Otherwise, just display the property as a string
          return <Fragment key={index}>{property}</Fragment>;
        })}
      </SeparatedList>
    </div>
  );
}

UnspecifiedProperty.propTypes = {
  // Property to display in as good a form as possible
  properties: PropTypes.arrayOf(PropTypes.string),
};
