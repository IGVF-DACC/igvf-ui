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
    display: (source, meta) => {
      const terms = meta.phenotypeTermsList;
      const featureTerm = terms.find(
        (term) => term["@id"] == source.source.feature
      );
      return (
        <Link href={source.source["@id"]}>
          {featureTerm ? featureTerm.term_name : source.source["@id"]}
        </Link>
      );
    },
  },
  {
    id: "feature",
    title: "Feature",
    display: (source, meta) => {
      const terms = meta.phenotypeTermsList;
      // Filter the list to contain only the term that matches the one in the source feature
      const featureTerm = terms.find(
        (term) => term["@id"] === source.source.feature
      );
      // If we found it, then use it, otherwise use the full path
      const termId = featureTerm ? featureTerm.term_id : source.source.feature;
      return <Link href={source.source.feature}>{termId}</Link>;
    },
  },
  {
    id: "quantity",
    title: "Quantity",
    display: ({ source }) => `${source.quantity} ${source.quantity_units}`,
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
  phenotypeTermsList,
}) {
  return (
    <DataGridContainer>
      <SortableGrid
        data={phenotypicFeatures}
        columns={phenotypicFeaturesColumns}
        keyProp="@id"
        meta={{ phenotypeTermsList }}
      />
    </DataGridContainer>
  );
}

PhenotypicFeatureTable.propTypes = {
  // Phenotypic Features to display
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Phenotype Terms associated with the features
  phenotypeTermsList: PropTypes.arrayOf(PropTypes.object).isRequired,
};
