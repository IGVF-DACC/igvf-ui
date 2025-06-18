// node_modules
import _ from "lodash";
import { Fragment } from "react";
// components
import {
  CollapseControlVertical,
  DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  useCollapseControl,
} from "../collapse-control";
import Link from "../link-no-prefetch";
import SeparatedList from "../separated-list";
// lib
import { isValidPath, isValidUrl, truncateJson } from "../../lib/general";
import { getUnknownProperty } from "../../lib/report";
// root
import type { DatabaseObject } from "../../globals";

/**
 * DataGrid cell renderer to display a generic boolean as a "yes" or "no" string.
 * @param values - Array of boolean values to display
 */
function Boolean({ values }: { values: boolean[] }) {
  return (
    <div data-testid="cell-type-boolean">
      <SeparatedList>
        {values.map((value, index) => (
          <Fragment key={index}>{value ? "yes" : "no"}</Fragment>
        ))}
      </SeparatedList>
    </div>
  );
}

/**
 * Generic cell renderer for an array of paths/@ids linking to other pages on the site.
 * @param values - Array of path strings to display as links
 */
function PathArray({ values }: { values: string[] }) {
  const collapser = useCollapseControl(
    values,
    DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL
  );

  return (
    <div>
      <ul data-testid="cell-type-path-array">
        {collapser.items.map((path, index) => {
          // The report page's `getServerSideProps()` might have embedded the linked object in this
          // property. So if this path property has an object instead of a path string, get its @id
          // and use that as the link.
          return (
            <li key={index} className={`my-2 block first:mt-0 last:mb-0`}>
              <Link href={path}>{path}</Link>
            </li>
          );
        })}
      </ul>
      {collapser.isCollapseControlVisible && (
        <div className="mt-2">
          <CollapseControlVertical
            length={values.length}
            isCollapsed={collapser.isCollapsed}
            setIsCollapsed={collapser.setIsCollapsed}
            isFullBorder
          />
        </div>
      )}
    </div>
  );
}

/**
 * Generic cell renderer to display a sorted array of strings as a comma-separated list.
 * @param values - The array of strings to display
 */
function StringArray({ values }: { values: string[] }) {
  const uniqueValues = [...new Set(values)];
  const sortedValues = _.sortBy(uniqueValues, (value) => value.toLowerCase());
  return (
    <div data-testid="cell-type-string-array">{sortedValues.join(", ")}</div>
  );
}

/**
 * Generic cell renderer to display a non-formatted JSON string for a report cell. Unlike other
 * generic cell renderers, this one does not handle arrays or objects -- it displays the first
 * JSON in an array, if any. It also truncates the JSON string if it's too long.
 * @param value - JSON string to display
 */
function Json({ value }: { value: object }) {
  const jsonString = JSON.stringify(value);
  return (
    <code className="text-xs" data-testid="cell-type-json">
      {truncateJson(jsonString)}
    </code>
  );
}

/**
 * Generic cell renderer to display an external URL string as a link, and opening that link in a
 * new tab.
 * @param values - URL strings to display
 */
function Url({ values }: { values: string[] }) {
  return (
    <SeparatedList>
      {values.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="cell-type-url"
        >
          {url}
        </a>
      ))}
    </SeparatedList>
  );
}

/**
 * Renders the contents of a report cell, given the object displayed on a row in the report and the
 * cell's property name. The property name can have dotted notation, so we might have to drill down
 * into the object's property (might be an object, array, array of objects, etc.) to get the value
 * to render. This is the default DataGrid cell renderer for any property that does not have a
 * specific renderer defined.
 * @param id - Property name of the cell to render, which can be a dotted notation
 * @param source - Source object containing the property to render
 */
export function GeneralCellRenderer({
  id,
  source,
}: {
  id: string;
  source: DatabaseObject;
}) {
  const values = getUnknownProperty(id, source);
  if (values.length > 0) {
    const representativeValue = values[0];
    if (typeof representativeValue === "boolean") {
      return <Boolean values={values as boolean[]} />;
    }
    if (typeof representativeValue === "object") {
      return <Json value={representativeValue} />;
    }
    if (isValidPath(representativeValue as string)) {
      return <PathArray values={values as string[]} />;
    }
    if (isValidUrl(representativeValue as string)) {
      return <Url values={values as string[]} />;
    }
    if (typeof representativeValue === "string") {
      return <StringArray values={values as string[]} />;
    }
    if (typeof representativeValue === "number") {
      return <>{values.join(", ")}</>;
    }
  }
}
