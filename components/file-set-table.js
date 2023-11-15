// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataGridContainer } from "./data-grid";
import ScrollIndicators from "../components/scroll-indicators";
import SortableGrid from "./sortable-grid";
import Status from "./status";
import TableCount from "./table-count";

const fileSetColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <Link href={source["@id"]}>{source.accession}</Link>
    ),
  },
  {
    id: "summary",
    title: "Summary",
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => source.aliases?.join(", "),
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title || null,
  },
  {
    id: "status",
    title: "Status",
    display: ({ source }) => {
      return <Status status={source.status} />;
    },
  },
];

/**
 * Display a sortable table of the given file sets.
 */
export default function FileSetTable({ fileSets }) {
  const gridRef = useRef(null);

  return (
    <>
      <TableCount count={fileSets.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid
            data={fileSets}
            columns={fileSetColumns}
            keyProp="@id"
          />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

FileSetTable.propTypes = {
  // File sets to display
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
};
