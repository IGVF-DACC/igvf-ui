// components/report
import {
  reportPropertyRenderers,
  detectPropertyTypes,
  propertyRenderers,
  typeRenderers,
} from "./cell-renderers";

/**
 * Given report types and column property, return a custom column renderer to display the contents
 * of the cells in the column.
 * @param {Array<string>} types types of the items in the report
 * @param {string} property Schema property name of the column to display
 * @param {object} profile Schema profile for the report's type
 * @returns {function} React component to render the column; null if no custom renderer
 */
function getColumnRenderer(types, property, schemaProperties) {
  // For columns with a renderer matching both the column's property and a specific report type.
  const matchingType = types.find((type) => {
    return (
      reportPropertyRenderers[type] && reportPropertyRenderers[type][property]
    );
  });
  if (matchingType) {
    return reportPropertyRenderers[matchingType][property];
  }

  // For columns with a renderer matching a column's property regardless of report type. This lets
  // us use the same renderer for the same property across different reports.
  if (propertyRenderers[property]) {
    return propertyRenderers[property];
  }

  // No custom renderer based on property name, so detect the property type and use a generic
  // renderer appropriate for that type.
  let detectedType;
  if (schemaProperties) {
    detectedType = detectPropertyTypes(property, schemaProperties);
  }
  return typeRenderers[detectedType];
}

/**
 * Generate a list of report columnSpecs in a format suitable for `<SortableGrid>`. The columns to
 * display for the selected report object type can come from the "field=" query string parameter or
 * from the object's schema's `columns` property if the query string contains no "field="
 * parameters. The returned columnSpecs differ from normal columnSpecs in that they have a `display`
 * property that contains a React component to render the column's cells.
 * @param {Array<string>} selectedTypes Types of the items in the report
 * @param {Array<object>} visibleColumnSpecs ColumnSpecs for the columns to display in the report
 * @param {object} schemaProperties Merged schema profile for the report's types
 * @returns {object} Sortable grid columns
 */
export default function generateColumns(
  selectedTypes,
  visibleColumnSpecs,
  schemaProperties
) {
  // Add a custom cell renderer to each columnSpec in which one exists.
  visibleColumnSpecs.forEach((column) => {
    const DisplayComponent = getColumnRenderer(
      selectedTypes,
      column.id,
      schemaProperties
    );
    column.display = DisplayComponent;
  });

  return visibleColumnSpecs;
}
