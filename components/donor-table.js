// node_modules
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid from "./sortable-grid";
import { AliasesCell } from "./table-cells";

const columns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
    ),
    sorter: (item) => item.accession,
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesCell source={source} />,
    isSortable: false,
  },
  {
    id: "sex",
    title: "Sex",
  },
  {
    id: "taxa",
    title: "Taxa",
  },
];

/**
 * Display the given donors in a table.
 */
export default function DonorTable({ donors, title = "Donors" }) {
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SortableGrid data={donors} columns={columns} pager={{}} keyProp="@id" />
    </>
  );
}

DonorTable.propTypes = {
  // Donors to display in the table
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Optional title to display if not "Donors"
  title: PropTypes.string,
};
