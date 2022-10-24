// components/colleciton
import {
  collectionPropertyRenderers,
  detectPropertyTypes,
  propertyRenderers,
  typeRenderers,
} from "./cell-renderers";

/**
 * Given a collection type and column property, return a custom column renderer to display the
 * contents of the cells in the column.
 * @param {string} type @type of the items in the collection
 * @param {string} property Schema property name of the column to display
 * @param {object} profile Schema profile for the collection's type
 * @returns {function} React component to render the column; null if no custom renderer
 */
const getColumnRenderer = (type, property, profile) => {
  // For columns with a renderer matching both the column's property and a specific collection type.
  if (
    collectionPropertyRenderers[type] &&
    collectionPropertyRenderers[type][property]
  ) {
    return collectionPropertyRenderers[type][property];
  }

  // For columns with a renderer matching a column's property regardless of collection type. This
  // lets us use the same renderer for the same property across different collections.
  if (propertyRenderers[property]) {
    return propertyRenderers[property];
  }

  // No custom renderer based on property name, so detect the property type and use a generic
  // renderer appropriate for that type.
  const detectedType = detectPropertyTypes(property, profile);
  return typeRenderers[detectedType];
};

/**
 * Generate a list of report columns in a format suitable for <SortableGrid>.
 * @param {object} profiles Profile for one schema object type
 * @param {string} type @type of the schema object
 * @returns {object} Sortable grid columns
 */
const generateTableColumns = (profiles, type) => {
  const profile = profiles[type];
  return Object.keys(profile.properties).map((property) => {
    const column = {
      id: property,
      title: profile.properties[property].title,
    };

    // Determine whether the column has a custom renderer and if so, add it to the column as its
    // display property.
    const DisplayComponent = getColumnRenderer(type, property, profile);

    // @id property should display a link to the object displayed in the collection table.
    if (DisplayComponent) {
      column.display = DisplayComponent;
    }
    return column;
  });
};

export default generateTableColumns;
