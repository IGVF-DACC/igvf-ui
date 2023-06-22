/**
 * Contains all the cell renderers used on the report pages including those specific to a property
 * in a particular report, to a property in any report, and properties of any type that need more
 * than the basic rendering of a string or number. Regardless of the specificity of any renderers
 * you add, keep them in alphabetical order in this file.
 */

// node_modules
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import ChromosomeLocations from "../chromosome-locations";
import SeparatedList from "../separated-list";
// lib
import { attachmentToServerHref } from "../../lib/attachment";
import { truncateJson } from "../../lib/general";

/**
 * Display the @id of an object as a link to the object's page. This works much like the `Path`
 * renderer, but `@id` has a slightly odd schema definition, so it needs its own custom renderer.
 */
function AtId({ source }) {
  return (
    <Link href={source["@id"]} data-testid="cell-type-atid">
      {source["@id"]}
    </Link>
  );
}

AtId.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // @id of the object displayed in a row
    "@id": PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * Displays the embedded `attachment` object as a link to the attachment file.
 */
function Attachment({ source }) {
  if (source.attachment) {
    return (
      <a
        className="break-all"
        href={attachmentToServerHref(source.attachment, source["@id"])}
        target="_blank"
        rel="noreferrer"
        aria-label={`Download ${source.attachment.download}`}
        data-testid="cell-type-attachment"
      >
        {source.attachment.download}
      </a>
    );
  }
  return null;
}

Attachment.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // @id of the object displayed in a row
    "@id": PropTypes.string.isRequired,
    // Attachment embedded object
    attachment: PropTypes.shape({
      download: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

/**
 * Display a generic boolean as a "yes" or "no" string.
 */
function Boolean({ id, source }) {
  if (source[id] !== undefined) {
    return (
      <div data-testid="cell-type-boolean">{source[id] ? "Yes" : "No"}</div>
    );
  }
  return null;
}

Boolean.propTypes = {
  // Name of the property displayed in a cell
  id: PropTypes.string.isRequired,
  // Object displayed in a row
  source: PropTypes.object.isRequired,
};

/**
 * Display the `external_resources` property of a donor object. This takes care of those both with
 * and without a `resource_url` property, displaying a link to an external site if the external
 * resource includes `resource_url`.
 */
function ExternalResources({ source }) {
  if (source.external_resources?.length > 0) {
    return (
      <SeparatedList testid="cell-type-external-resources">
        {source.external_resources.map((resource, index) => (
          <div key={index} className="my-2 first:mt-0 last:mb-0">
            {resource.resource_url ? (
              <>
                <a
                  className="block"
                  href={resource.resource_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {resource.resource_identifier}
                </a>
                <div>{resource.resource_name}</div>
              </>
            ) : (
              <>
                <div>{resource.resource_identifier}</div>
                <div>{resource.resource_name}</div>
              </>
            )}
          </div>
        ))}
      </SeparatedList>
    );
  }
  return null;
}

ExternalResources.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // @id of the object displayed in a row
    external_resources: PropTypes.arrayOf(
      PropTypes.shape({
        resource_url: PropTypes.string,
        resource_identifier: PropTypes.string,
      })
    ),
  }).isRequired,
};

/**
 * Display the gene locations of a gene object.
 */
function GeneLocations({ source }) {
  if (source.locations?.length > 0) {
    return (
      <ChromosomeLocations
        locations={source.locations}
        testid="cell-type-gene-locations"
      />
    );
  }
  return null;
}

GeneLocations.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // Array of embedded gene locations objects
    locations: PropTypes.object.isRequired,
  }).isRequired,
};

/**
 * Report cell renderer for a Page parent link. We can't use the `Path` component because the Page
 * `parent`'s `type` property has the only array type among all schemas, so rather than messing up
 * the type detection function below for this weird case, just treat this as a special renderer for
 * this report/property type.
 */
function PageParent({ source }) {
  if (source.parent) {
    return (
      <Link href={source.parent} data-testid="cell-type-page-parent">
        {source.parent}
      </Link>
    );
  }
  return null;
}

PageParent.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // Link to the parent page
    parent: PropTypes.string,
  }).isRequired,
};

/**
 * Report cell renderer for a single path/@id linking to another page on the site.
 */
function Path({ id, source }) {
  const path = source[id];
  if (path) {
    // The report search results might have embedded the linked object in this property. So if this
    // path property has an object, get its @id and use that as the link.
    const resolvedPath = typeof path === "object" ? path["@id"] : path;
    return (
      <Link href={resolvedPath} data-testid="cell-type-path">
        {resolvedPath}
      </Link>
    );
  }
  return null;
}

Path.propTypes = {
  // Property name of column being rendered
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Report cell renderer for an array of paths/@ids linking to other pages on the site.
 */
function PathArray({ id, source }) {
  const paths = source[id];
  if (paths?.length > 0) {
    return (
      <div data-testid="cell-type-path-array">
        {paths.map((path, index) => {
          // The report page's `getServerSideProps()` might have embedded the linked object in this
          // property. So if this path property has an object instead of a path string, get its @id
          // and use that as the link.
          const isObject = path !== null && typeof path === "object";
          const resolvedPath = isObject ? path["@id"] : path;
          return (
            <Link
              key={index}
              href={resolvedPath}
              className="my-2 block first:mt-0 last:mb-0"
            >
              {resolvedPath}
            </Link>
          );
        })}
      </div>
    );
  }
  return null;
}

PathArray.propTypes = {
  // Property name of column being rendered
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Displays an array of a primitive type as a comma-separated list.
 */
function SimpleArray({ id, source }) {
  const arrayProperty = source[id];
  if (arrayProperty?.length > 0) {
    return (
      <span data-testid="cell-type-simple-array">
        {_.sortBy(arrayProperty).join(", ")}
      </span>
    );
  }
  return null;
}

SimpleArray.propTypes = {
  // Property name of column being rendered
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Display an object for which we have no dedicated renderer. What it displays depends on the type
 * of the object in `source`, basically having a primitive version of the renderers for known cell
 * properties.
 */
function UnknownObject({ id, source }) {
  // Break the dotted-notation property into its components and walk the source object to find the
  // embedded property. Nice to use a `reduce()` loop but we can't break out of those early.
  const components = id.split(".");
  let property = source;
  for (let i = 0; i < components.length; i += 1) {
    if (Array.isArray(property)) {
      // Extract the specified property component from each element of the array.
      const embeddedProperties = property.map((item) => item[components[i]]);
      property = embeddedProperties.filter((item) => item).join(", ");
    } else {
      // Extract the specified property component from the embedded property.
      property = property[components[i]];
    }
    if (!property) {
      // A component of the dotted-notation property doesn't exist in the source object, so end
      // the loop early, and display nothing in the cell.
      break;
    }
  }

  if (property) {
    // Determine the display method for the embedded property depending on its type.
    let displayedProperty = null;
    if (typeof property === "string" || typeof property === "number") {
      displayedProperty = property;
    } else if (typeof property === "object") {
      if (Array.isArray(property)) {
        if (property.length > 0) {
          if (typeof property[0] === "object") {
            if (property[0]["@id"]) {
              // Array of objects with @ids; join their @ids with commas.
              displayedProperty = property
                .map((item) => item["@id"])
                .join(", ");
            } else {
              // Array of objects without @ids; display it as JSON.
              displayedProperty = truncateJson(property);
            }
          } else {
            // Array of simple types; join them with commas.
            displayedProperty = property.join(", ");
          }
        }
      } else {
        if (property["@id"]) {
          // The embedded property is an object with an @id. Display the @id.
          displayedProperty = property["@id"];
        } else {
          // The embedded property is an object without an @id. Display it as JSON.
          displayedProperty = truncateJson(property);
        }
      }
    }

    return (
      <div data-testid="cell-type-unknown-object">{displayedProperty}</div>
    );
  }

  return null;
}

UnknownObject.propTypes = {
  // Name of property to display, including dotted-notation properties, e.g. `submitted_by.title`
  id: PropTypes.string.isRequired,
  // Object displayed in a cell
  source: PropTypes.object.isRequired,
};

/**
 * Renders an external URL string as a link.
 */
function Url({ id, source }) {
  const urlProperty = source[id];
  if (urlProperty) {
    return (
      <a
        href={urlProperty}
        target="_blank"
        rel="noreferrer"
        data-testid="cell-type-url"
      >
        {urlProperty}
      </a>
    );
  }
}

Url.propTypes = {
  // Property name of column
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * The following objects define which cell-renderer components to use for each object property
 * displayed in the table. Each new cell renderer you add should go into one of these objects:
 *
 * reportPropertyRenderers: Use this for renderers for specific named properties in a specific
 * report type. The same property in a different report doesn't use this renderer. The report type
 * forms the top-level keys of this object, and the property names within the report comprise the
 * second-level keys. The values reference the cell-renderer component for the corresponding report
 * type and property. Keep this object alphabetized by report type and then by property within each
 * report type.
 *
 * propertyRenderers: Use this for renderers for specific named properties in any report type. This
 * has only one level of keys matching the property name that maps to the cell-renderer component.
 * Keep this object alphabetized by property name. You can have the same property name in both this
 * object and the `reportPropertyRenderers` object, but the `reportPropertyRenderers` object takes
 * precedence for the particular report type the property belongs to.
 *
 * typeRenderers: Use this for renderers for simple or composite types in any report type without
 * regard for a specific property name. Use this for schema property types that could occur for
 * multiple properties in a report. To make a renderer for a new type, come up with a type name that
 * uniquely identifies the type, and add it as a key to this object. The value should reference the
 * cell-renderer component for that new type. Then detect this type in the `detectPropertyTypes`
 * function. Keep this object alphabetized by type name, and comment what purpose each serves
 * because the type names don't necessarily match Javascript types.
 */

export const reportPropertyRenderers = {
  Gene: {
    locations: GeneLocations,
  },
  Page: {
    parent: PageParent,
  },
};

export const propertyRenderers = {
  "@id": AtId,
  attachment: Attachment,
  external_resources: ExternalResources,
};

export const typeRenderers = {
  boolean: Boolean, // Boolean value
  path: Path, // Single path
  "path-array": PathArray, // Array of paths
  simple: null, // String, number, boolean, or null get default renderer
  "simple-array": SimpleArray, // Array of strings or numbers
  unknown: UnknownObject, // Complex array or object with no dedicated renderer
  url: Url, // External URL string
};

/**
 * Detect the type of a column property given the schema profile for the displayed report. These
 * types don't necessarily represent Javascript types; the types allow us to distinguish between
 * schema properties that need rendering in specific ways.
 * @param {string} property Check the type of this column's property
 * @param {object} profile Schema profile to check the property against
 * @returns {string} The type of the property; see `typeRenderers`
 */
export function detectPropertyTypes(property, profile) {
  const propertyDefinition = profile.properties[property];
  let propertyType = "unknown";
  if (propertyDefinition) {
    if (propertyDefinition.type === "array" && propertyDefinition.items) {
      // Array of somethings.
      if (
        propertyDefinition.items.type === "number" ||
        propertyDefinition.items.type === "integer"
      ) {
        // Array of numbers.
        propertyType = "simple-array";
      } else if (propertyDefinition.items.type === "string") {
        // Array of strings of some kind.
        if (propertyDefinition.items.linkTo) {
          // Array of strings containing paths.
          propertyType = "path-array";
        } else {
          // Array of strings of generic text.
          propertyType = "simple-array";
        }
      } else {
        // Array of objects; display as JSON.
        propertyType = "unknown";
      }
    } else if (propertyDefinition.type === "string") {
      // Individual string of some kind.
      if (propertyDefinition.linkTo) {
        // String for a path.
        propertyType = "path";
      } else if (propertyDefinition.format === "uri") {
        // String for an external URI.
        propertyType = "url";
      } else {
        // String of generic text.
        propertyType = "simple";
      }
    } else if (
      propertyDefinition.type === "number" ||
      propertyDefinition.type === "integer"
    ) {
      // Individual number.
      propertyType = "simple";
    } else if (propertyDefinition.type === "boolean") {
      // Boolean value.
      propertyType = "boolean";
    } else {
      // Unknown type; display as JSON.
      propertyType = "unknown";
    }
  }

  // Property type unrecognized.
  return propertyType;
}
