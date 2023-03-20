// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

/*
phenotypic feature
lab	"/labs/j-michael-cherry/"
award	"/awards/HG012012/"
notes	"Phenotypic feature of body weight"
status	"released"
feature	"/phenotype-terms/NCIT_C92648/"
quantity	58
quantity_units	"kilogram"
schema_version	"1"
observation_date	"2022-11-15"
creation_timestamp	"2023-03-06T23:31:20.467925+00:00"
@id: /phenotypic-features/ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa/
*/

const phenotypicFeaturesColumns = [
  {
    id: "phenotypic_feature_id",
    title: "Phenotypic Feature",
    display: ({ source }) => {
      return (
        <Link href={source["@id"]}>
          {source.notes ? source.notes : source["@id"]}
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
        (term) => term["@id"] == source.source.feature
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
        keyProp="phenotypic_feature_id"
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
