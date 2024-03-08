// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import SortableGrid from "./sortable-grid";
import Status from "./status";

const modificationsColumns = [
  {
    id: "modality",
    title: "Modality",
  },
  {
    id: "summary",
    title: "Summary",
    display: ({ source }) => {
      return <Link href={source["@id"]}>{source.summary}</Link>;
    },
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
 * Display a sortable table of the given modifications.
 */
export default function ModificationTable({
  modifications,
  title = "Modifications",
}) {
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SortableGrid
        data={modifications}
        columns={modificationsColumns}
        keyProp="@id"
      />
    </>
  );
}

ModificationTable.propTypes = {
  // Modifications to display
  modifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title for the table if not "Modifications"
  title: PropTypes.string,
};
