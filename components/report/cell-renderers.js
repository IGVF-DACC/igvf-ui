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
import { FileDownload } from "../file-download";
import {
  CollapseControlVertical,
  DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  useCollapseControl,
} from "../collapse-control";
import MarkdownSection from "../markdown-section";
import SeparatedList from "../separated-list";
import { AliasesCell } from "../table-cells";
import UnspecifiedProperty from "../unspecified-property";
// lib
import { attachmentToServerHref } from "../../lib/attachment";
import { API_URL } from "../../lib/constants";
import { dataSize, truthyOrZero } from "../../lib/general";
import { getUnknownProperty } from "../../lib/report";

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
 * Display a vertical list of aliases and allow it to break on any character to avoid making an
 * unreasonably wide column. It seems unlikely that a cell would have so many aliases that it
 * needs a collapse/expand button.
 */
function Aliases({ source }) {
  return <AliasesCell source={source} />;
}

Aliases.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // Array of aliases
    aliases: PropTypes.arrayOf(PropTypes.string),
  }),
};

/**
 * Display a linked list of biosample sample terms, showing the sample term name as the link text.
 */
function SampleTerms({ id, source }) {
  const sampleTerms = source[id];
  if (sampleTerms) {
    // Non-collapsible list of sample terms because only one term can exist in this array.
    return (
      <SeparatedList>
        {sampleTerms.map((sampleTerm) => {
          return (
            <Link key={sampleTerm["@id"]} href={sampleTerm["@id"]}>
              {sampleTerm.term_name}
            </Link>
          );
        })}
      </SeparatedList>
    );
  }
  return null;
}

SampleTerms.propTypes = {
  // Property name of column being rendered
  id: PropTypes.string.isRequired,
  // Object displayed in a row
  source: PropTypes.object.isRequired,
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
    locations: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};

/**
 * Use a generic renderer for the case in which no schema exists to determine the types of the
 * properties in the report.
 */
function Generic({ id, source }) {
  const value = source[id];
  if (typeof value === "string" || typeof value === "number") {
    return <>{value}</>;
  }
  return <>{JSON.stringify(value)}</>;
}

Generic.propTypes = {
  // Property name of column being rendered
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Display a file-download button along with the full download path to the file.
 */
function Href({ source }) {
  // Wrap in a div because the cell has a flex class we don't want to inherit.
  return (
    <div>
      <div className="flex">
        <FileDownload file={source} className="shrink" />
      </div>
      <div>{`${API_URL}${source.href}`}</div>
    </div>
  );
}

Href.propTypes = {
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
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
  const paths = source[id] || [];
  const collapser = useCollapseControl(
    paths,
    DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL
  );

  // The second if condition is only necessary for crash avoidance until IGVF-1791.
  if (paths.length > 0 && Array.isArray(collapser.items)) {
    return (
      <div>
        <ul data-testid="cell-type-path-array">
          {collapser.items.map((path, index) => {
            // The report page's `getServerSideProps()` might have embedded the linked object in this
            // property. So if this path property has an object instead of a path string, get its @id
            // and use that as the link.
            const isObject = path !== null && typeof path === "object";
            const resolvedPath = isObject ? path["@id"] : path;
            return (
              <li key={index} className={`my-2 block first:mt-0 last:mb-0`}>
                <Link key={index} href={resolvedPath}>
                  {resolvedPath}
                </Link>
              </li>
            );
          })}
        </ul>
        {collapser.isCollapseControlVisible && (
          <div className="mt-2">
            <CollapseControlVertical
              length={paths.length}
              isCollapsed={collapser.isCollapsed}
              setIsCollapsed={collapser.setIsCollapsed}
              isFullBorder
            />
          </div>
        )}
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
 * Display the audit details and categories for a particular audit level.
 */
function AuditDetail({ id, source }) {
  if (source.audit) {
    // Extract the audit level from the id that's in the form `audit.ERROR.detail`.
    const auditLevel = id.split(".")[1];
    if (source.audit[auditLevel]) {
      // Sort the audit level array elements by case-insensitive category, then display each
      // category and detail.
      const audits = _.sortBy(source.audit[auditLevel], [
        (audit) => audit.category.toLowerCase(),
      ]);
      return (
        <div>
          {audits.map((audit, index) => {
            return (
              <div key={index} className="my-2 first:mt-0 last:mb-0">
                <MarkdownSection className="prose-p:text-sm">
                  {`**${audit.category}**: ${audit.detail}`}
                </MarkdownSection>
              </div>
            );
          })}
        </div>
      );
    }
  }
  return null;
}

AuditDetail.propTypes = {
  // Property name of column being rendered
  id: PropTypes.string.isRequired,
  // Object displayed in the current row
  source: PropTypes.shape({
    audit: PropTypes.shape({
      // Not really `level`, but the audit level: ERROR, WARNING, etc.
      level: PropTypes.arrayOf(
        PropTypes.shape({
          path: PropTypes.string.isRequired,
          detail: PropTypes.string.isRequired,
          category: PropTypes.string.isRequired,
        })
      ),
    }),
  }).isRequired,
};

/**
 * Display an object for which we have no dedicated renderer. What it displays depends on the type
 * of the object in `source`, basically having a primitive version of the renderers for known cell
 * properties.
 */
function UnknownObject({ id, source }) {
  const properties = getUnknownProperty(id, source);

  if (properties.length > 0) {
    return (
      <div data-testid="cell-type-unknown-object">
        <UnspecifiedProperty properties={properties} />
      </div>
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
 * Display a attachment-download button along with the full download path to the document or image.
 */
function AttachmentHref({ source }) {
  // Wrap in a div because the cell has a flex class we don't want to inherit.
  return (
    source.attachment?.href && (
      <div>
        <div className="flex">
          <FileDownload file={source} className="shrink" />
        </div>
        <div>{`${API_URL}${source["@id"]}${source.attachment.href}`}</div>
      </div>
    )
  );
}

AttachmentHref.propTypes = {
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Display a list of full download path to the FileSet.
 */
function FilesHref({ source }) {
  const hrefs = source.files
    ? source.files
        .map((file) => {
          if (file.href) {
            return `${API_URL}${file.href}`;
          }
        })
        .filter((e) => e !== undefined)
    : [];

  return <div>{hrefs.join(", ")}</div>;
}

FilesHref.propTypes = {
  // Object displayed in the current row
  source: PropTypes.object.isRequired,
};

/**
 * Display a formatted file size.
 */
function FileSize({ id, source }) {
  return truthyOrZero(source[id]) ? <div>{dataSize(source[id])}</div> : null;
}

FileSize.propTypes = {
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
  Biosample: {
    sample_terms: SampleTerms,
  },
  Gene: {
    locations: GeneLocations,
  },
  InVitroSystem: {
    sample_terms: SampleTerms,
  },
  MultiplexedSample: {
    sample_terms: SampleTerms,
  },
  Page: {
    parent: PageParent,
  },
  PrimaryCell: {
    sample_terms: SampleTerms,
  },
  Sample: {
    sample_terms: SampleTerms,
  },
  TechnicalSample: {
    sample_terms: SampleTerms,
  },
  Tissue: {
    sample_terms: SampleTerms,
  },
  WholeOrganism: {
    sample_terms: SampleTerms,
  },
};

export const propertyRenderers = {
  "@id": AtId,
  aliases: Aliases,
  attachment: Attachment,
  "audit.ERROR.detail": AuditDetail,
  "audit.WARNING.detail": AuditDetail,
  "audit.NOT_COMPLIANT.detail": AuditDetail,
  "audit.INTERNAL_ACTION.detail": AuditDetail,
  href: Href,
  "attachment.href": AttachmentHref,
  "files.href": FilesHref,
  file_size: FileSize,
};

export const typeRenderers = {
  boolean: Boolean, // Boolean value
  path: Path, // Single path
  "path-array": PathArray, // Array of paths
  simple: Generic, // String, number, boolean, or null get default renderer
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
  const propertyDefinition = profile?.[property];
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
