// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataGridContainer } from "./data-grid";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import TableCount from "./table-count";

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
export default function PhenotypicFeatureTable({ phenotypicFeatures }) {
  const gridRef = useRef(null);

  return (
    <>
      <TableCount count={phenotypicFeatures.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid
            data={phenotypicFeatures}
            columns={phenotypicFeaturesColumns}
            keyProp="@id"
          />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

PhenotypicFeatureTable.propTypes = {
  // Phenotypic Features to display
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
};
