// components/report
import {
  reportPropertyRenderers,
  detectPropertyTypes,
  propertyRenderers,
  typeRenderers,
} from "./cell-renderers";
// lib
import { getReportType, getVisibleReportColumnSpecs } from "../../lib/report";

/**
 * Given a report type and column property, return a custom column renderer to display the contents
 * of the cells in the column.
 * @param {string} type @type of the items in the report
 * @param {string} property Schema property name of the column to display
 * @param {object} profile Schema profile for the report's type
 * @returns {function} React component to render the column; null if no custom renderer
 */
function getColumnRenderer(type, property, profile) {
  // For columns with a renderer matching both the column's property and a specific report type.
  if (
    reportPropertyRenderers[type] &&
    reportPropertyRenderers[type][property]
  ) {
    return reportPropertyRenderers[type][property];
  }

  // For columns with a renderer matching a column's property regardless of report type. This lets
  // us use the same renderer for the same property across different reports.
  if (propertyRenderers[property]) {
    return propertyRenderers[property];
  }

  // No custom renderer based on property name, so detect the property type and use a generic
  // renderer appropriate for that type.
  const detectedType = detectPropertyTypes(property, profile);
  return typeRenderers[detectedType] || null;
}

/**
 * Generate a list of report columnSpecs in a format suitable for `<SortableGrid>`. The columns to
 * display for the selected report object type can come from the "field=" query string parameter or
 * from the object's schema's `columns` property if the query string contains no "field="
 * parameters. The returned columnSpecs differ from normal columnSpecs in that they have a `display`
 * property that contains a React component to render the column's cells.
 * @param {object} searchResults Search results for a report
 * @param {object} profiles Schemas for all types; don't pass null
 * @returns {object} Sortable grid columns
 */
export default function generateColumns(searchResults, profiles) {
  const reportType = getReportType(searchResults);
  const columns = getVisibleReportColumnSpecs(searchResults, profiles);

  // Add a custom cell renderer to each columnSpec in which one exists.
  columns.forEach((column) => {
    const DisplayComponent = getColumnRenderer(
      reportType,
      column.id,
      profiles[reportType],
    );
    if (DisplayComponent) {
      column.display = DisplayComponent;
    }
  });

  return columns;
}
