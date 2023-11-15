// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataGridContainer } from "./data-grid";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import TableCount from "./table-count";

const biomarkersColumns = [
  {
    id: "biomarker_id",
    title: "Biomarker",
    display: ({ source }) => {
      return (
        <Link href={source["@id"]}>
          {source.name} {source.quantification}
        </Link>
      );
    },
  },
  {
    id: "classification",
    title: "Classification",
  },
  {
    id: "synonyms",
    title: "Synonyms",
    display: ({ source }) =>
      source.synonyms ? source.synonyms.join(", ") : "",
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => source.aliases?.join(", "),
  },
];

/**
 * Display a sortable table of the given treatments.
 */
export default function BiomarkerTable({ biomarkers }) {
  const gridRef = useRef(null);

  return (
    <>
      <TableCount count={biomarkers.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid
            data={biomarkers}
            columns={biomarkersColumns}
            keyProp="@id"
          />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

BiomarkerTable.propTypes = {
  // Biomarkers to display
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
};
