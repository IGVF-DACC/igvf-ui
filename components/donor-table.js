// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
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
  {
    id: "ethnicities",
    title: "Ethnicities",
    display: ({ source }) => {
      if (source.ethnicities?.length > 0) {
        // Use non-mutating sorting, the default locale, and ignore case (base sensitivity).
        const sortedEthnicities = source.ethnicities.toSorted((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        return sortedEthnicities.join(", ");
      }
      return "";
    },
    hide: (data) => !data.some((item) => item.ethnicities?.length > 0),
    isSortable: false,
  },
  {
    id: "strain",
    title: "Strain",
    hide: (data) => !data.some((item) => item.strain),
  },
];

/**
 * Display the given donors in a table.
 */
export default function DonorTable({
  donors,
  reportLink = null,
  reportLabel = null,
  title = "Donors",
  panelId = "donor-table",
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && reportLabel && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={donors}
          columns={columns}
          pager={{}}
          keyProp="@id"
        />
      </div>
    </>
  );
}

DonorTable.propTypes = {
  // Donors to display in the table
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Optional link to a report
  reportLink: PropTypes.string,
  // Optional label for the report link
  reportLabel: PropTypes.string,
  // Optional title to display if not "Donors"
  title: PropTypes.string,
  // ID of the panel for the section directory
  panelId: PropTypes.string,
};
