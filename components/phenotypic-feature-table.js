// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

const phenotypicFeaturesColumns = [
  {
    id: "phenotypic_feature_id",
    title: "Phenotypic Feature",
    display: (source) => {
      const featureTerm = source.source.feature;
      return <Link href={source.source["@id"]}>{featureTerm.term_name}</Link>;
    },
  },
  {
    id: "feature",
    title: "Feature",
    display: (source) => {
      // If we found it, then use it, otherwise use the full path
      const termId = source.source.feature.term_id;
      return <Link href={source.source.feature["@id"]}>{termId}</Link>;
    },
  },
  {
    id: "quantity",
    title: "Quantity",
    display: ({ source }) =>
      `${source.quantity} ${source.quantity_units}${
        source.quantity === 1 ? "" : "s"
      }`,
  },
  {
    id: "observation_date",
    title: "Observation Date",
  },
];

/**
 * Display a sortable table of the given treatments.
 */
export default function PhenotypicFeatureTable({ phenotypicFeatures }) {
  return (
    <DataGridContainer>
      <SortableGrid
        data={phenotypicFeatures}
        columns={phenotypicFeaturesColumns}
        keyProp="@id"
      />
    </DataGridContainer>
  );
}

PhenotypicFeatureTable.propTypes = {
  // Phenotypic Features to display
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
};
