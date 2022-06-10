/**
 * Generate a list of report columns for the sortable grid.
 * @param {object} profile Profile for one DB object type
 * @returns {object} Sortable grid columns
 */
const reportColumns = (profile) => {
  return Object.keys(profile.properties).map((key) => {
    return {
      id: key,
      title: profile.properties[key].title,
    }
  })
}

export default reportColumns
