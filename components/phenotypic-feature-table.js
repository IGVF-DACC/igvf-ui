// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import SortableGrid from "./sortable-grid";

const phenotypicFeaturesColumns = [
  {
    id: "phenotypic_feature_id",
    title: "Feature Name",
    display: (source) => {
      const featureTerm = source.source.feature;
      return <Link href={source.source["@id"]}>{featureTerm.term_name}</Link>;
    },
  },
  {
    id: "feature",
    title: "Feature ID",
    display: (source) => {
      const termId = source.source.feature.term_id;
      return <Link href={source.source.feature["@id"]}>{termId}</Link>;
    },
  },
  {
    id: "quantity",
    title: "Quantity",
    display: ({ source }) => {
      if (source.quantity) {
        return (
          <>
            {source.quantity} {source.quantity_units}
            {source.quantity === 1 ? "" : "s"}
          </>
        );
      }
      return null;
    },
  },
  {
    id: "observation_date",
    title: "Observation Date",
  },
];

/**
 * Display a sortable table of the given treatments.
 */
export default function PhenotypicFeatureTable({
  phenotypicFeatures,
  title = "Phenotypic Features",
}) {
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SortableGrid
        data={phenotypicFeatures}
        columns={phenotypicFeaturesColumns}
        pager={{}}
        keyProp="@id"
      />
    </>
  );
}

PhenotypicFeatureTable.propTypes = {
  // Phenotypic Features to display
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title of the table if not "Phenotypic Features"
  title: PropTypes.string,
};
