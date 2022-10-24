/**
 * Contains all the cell renderers used on the collection pages including those specific to a
 * property in a particular collection, to a property in any collection, and properties of any type
 * that need more than the basic rendering of a string or number. Regardless of the specificity of
 * any renderers you add, keep them in alphabetical order in this file.
 */

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import Button from "../button";
import ChromosomeLocations from "../chromosome-locations";
import Modal from "../modal";
import SeparatedList from "../separated-list";
// lib
import { attachmentToServerHref } from "../../lib/attachment";
import { formatDateRange } from "../../lib/dates";

/**
 * Maximum number of characters to display for a JSON object in a cell.
 */
const MAX_CELL_JSON_LENGTH = 100;

/**
 * Display the @id of an object as a link to the object's page. This works much like the `Path`
 * renderer, but `@id` has a slightly odd schema definition, so it needs its own custom renderer.
 */
const AtId = ({ source }) => {
  return (
    <Link href={source["@id"]}>
      <a>{source["@id"]}</a>
    </Link>
  );
};

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
const Attachment = ({ source }) => {
  if (source.attachment) {
    return (
      <a
        className="break-all"
        href={attachmentToServerHref(source.attachment, source["@id"])}
        target="_blank"
        rel="noreferrer"
        aria-label={`Download ${source.attachment.download}`}
      >
        {source.attachment.download}
      </a>
    );
  }
  return null;
};

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
 * Display the `external_resources` property of a donor object. This takes care of those both with
 * and without a `resource_url` property, displaying a link to an external site if the external
 * resource includes `resource_url`.
 */
const ExternalResources = ({ source }) => {
  if (source.external_resources?.length > 0) {
    return (
      <SeparatedList>
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
};

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
const GeneLocations = ({ source }) => {
  if (source.locations?.length > 0) {
    return <ChromosomeLocations locations={source.locations} />;
  }
  return null;
};

GeneLocations.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // Array of embedded gene locations objects
    locations: PropTypes.object.isRequired,
  }).isRequired,
};

/**
 * Displays the `health_status_history` object of a human donor, including the history date range
 * and the description.
 */
const HealthStatusHistory = ({ source }) => {
  if (source.health_status_history?.length > 0) {
    return (
      <div>
        {source.health_status_history.map((healthStatus, index) => (
          <div
            key={index}
            data-testid="health-status-history"
            className="my-2 first:mt-0 last:mb-0"
          >
            <div>
              {formatDateRange(healthStatus.date_start, healthStatus.date_end)}
            </div>
            <div>{healthStatus.health_description}</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

HealthStatusHistory.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // Array of health-status history embedded objects
    health_status_history: PropTypes.arrayOf(
      PropTypes.shape({
        date_start: PropTypes.string,
        date_end: PropTypes.string,
        health_description: PropTypes.string,
      })
    ),
  }).isRequired,
};

/**
 * Collection cell renderer for a Page parent link. We can't use the `Path` component because the
 * Page `parent`'s `type` property has the only array type among all schemas, so rather than
 * messing up the type detection function below for this weird case, just treat this as a special
 * renderer for this collection/property type.
 */
const PageParent = ({ source }) => {
  if (source.parent) {
    return (
      <Link href={source.parent}>
        <a>{source.parent}</a>
      </Link>
    );
  }
  return null;
};

PageParent.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // Link to the parent page
    parent: PropTypes.string,
  }).isRequired,
};

/**
 * Collection cell renderer for a single path/@id linking to another page on the site.
 */
const Path = ({ id, source }) => {
  const path = source[id];
  if (path) {
    // The collection page's `getServerSideProps()` might have embedded the linked object in this
    // property. So if this path property has an object, get its @id and use that as the link.
    const resolvedPath = typeof path === "object" ? path["@id"] : path;
    return (
      <Link href={resolvedPath}>
        <a>{resolvedPath}</a>
      </Link>
    );
  }
  return null;
};

Path.propTypes = {
  // Property name of column being rendered
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Collection cell renderer for an array of paths/@ids linking to other pages on the site.
 */
const PathArray = ({ id, source }) => {
  const paths = source[id];
  if (paths?.length > 0) {
    return (
      <div>
        {paths.map((path, index) => {
          // The collection page's `getServerSideProps()` might have embedded the linked object in
          // this property. So if this path property has an object instead of a path string, get
          // its @id and use that as the link.
          const isObject = path !== null && typeof path === "object";
          const resolvedPath = isObject ? path["@id"] : path;
          return (
            <Link key={index} href={path}>
              <a className="my-2 block first:mt-0 last:mb-0">{resolvedPath}</a>
            </Link>
          );
        })}
      </div>
    );
  }
  return null;
};

PathArray.propTypes = {
  // Property name of column being rendered
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Displays an array of a primitive type as a comma-separated list.
 */
const SimpleArray = ({ id, source }) => {
  const arrayProperty = source[id];
  if (arrayProperty) {
    return <span>{arrayProperty.join(", ")}</span>;
  }
  return null;
};

SimpleArray.propTypes = {
  // Property name of column being rendered
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Display an object for which we have no dedicated renderer as stringified JSON. Truncate the
 * stringified JSON in the cell if it's longer than 100 characters. Display a button to open a
 * modal with the whole object's formatted JSON.
 */
const UnknownObject = ({ id, source }) => {
  // True if the modal showing formatted JSON is open
  const [isJsonModalOpen, setJsonModalOpen] = useState(false);

  const unknownObject = source[id];
  if (unknownObject) {
    const json = JSON.stringify(unknownObject);
    const displayJson =
      json.length > MAX_CELL_JSON_LENGTH
        ? `${json.substring(0, MAX_CELL_JSON_LENGTH)}...`
        : json;

    return (
      <div data-testid="unknown-object">
        {displayJson}
        <Button size="sm" onClick={() => setJsonModalOpen(true)}>
          View JSON
        </Button>
        <Modal isOpen={isJsonModalOpen} onClose={() => setJsonModalOpen(false)}>
          <Modal.Header onClose={() => setJsonModalOpen(false)}>
            <div>
              Formatted JSON for <pre className="inline font-bold">{id}</pre>{" "}
              Property
            </div>
          </Modal.Header>
          <Modal.Body>
            <pre className="overflow-x-auto text-sm">
              {JSON.stringify(unknownObject, null, 2)}
            </pre>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
  return null;
};

UnknownObject.propTypes = {
  // Property name for column
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Renders an external URL string as a link.
 */
const Url = ({ id, source }) => {
  const urlProperty = source[id];
  if (urlProperty) {
    return (
      <a href={urlProperty} target="_blank" rel="noreferrer">
        {urlProperty}
      </a>
    );
  }
};

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
 * collectionPropertyRenderers: Use this for renderers for specific named properties in a specific
 * collection. The same property in a different collection doesn't use this renderer. The
 * collection @type forms the top-level keys of this object, and the property names within the
 * collection form the second-level keys. The values reference the cell-renderer component for the
 * corresponding collection type and property. Keep this object alphabetized by collection type and
 * then by property within each collection type.
 *
 * propertyRenderers: Use this for renderers for specific named properties in any collection. This
 * has only one level of keys matching the property name that maps to the cell-renderer component.
 * Keep this object alphabetized by property name. You can have the same property name in both this
 * object and the `collectionPropertyRenderers` object, but the `collectionPropertyRenderers` object
 * takes precedence for the particular collection type the property belongs to.
 *
 * typeRenderers: Use this for renderers for simple or composite types in any collection without
 * regard for a specific property name. Use this for schema property types that could occur for
 * multiple properties in a collection. To make a renderer for a new type, come up with a type name
 * that uniquely identifies the type, and add it as a key to this object. The value should reference
 * the cell-renderer component for that new type. Then detect this type in the `detectPropertyTypes`
 * function. Keep this object alphabetized by type name, and comment what purpose each serves.
 */

export const collectionPropertyRenderers = {
  Gene: {
    locations: GeneLocations,
  },
  HumanDonor: {
    health_status_history: HealthStatusHistory,
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
  path: Path, // Single path
  "path-array": PathArray, // Array of paths
  "simple-array": SimpleArray, // Array of strings or numbers
  simple: null, // String, number, boolean, or null get default renderer
  unknown: UnknownObject, // Complex array or object with no dedicated renderer
  url: Url, // External URL string
};

/**
 * Detect the type of a column property given the schema profile for the displayed collection.
 * These types don't necessarily represent Javascript types; the types allow us to distinguish
 * between schema properties that need rendering in specific ways.
 * @param {string} property Check the type of this column's property
 * @param {object} profile Schema profile to check the property against
 * @returns {string} The type of the property; see `typeRenderers`
 */
export const detectPropertyTypes = (property, profile) => {
  const propertyDefinition = profile.properties[property];
  let propertyType = "";
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
      propertyDefinition.type === "integer" ||
      propertyDefinition.type === "boolean"
    ) {
      // Individual number or boolean.
      propertyType = "simple";
    } else {
      // Unknown type; display as JSON.
      propertyType = "unknown";
    }
  }

  // Property type unrecognized.
  return propertyType;
};
