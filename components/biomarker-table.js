// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid from "./sortable-grid";
import { AliasesCell } from "./table-cells";

const biomarkersColumns = [
  {
    id: "biomarker_id",
    title: "Biomarker",
    display: ({ source }) => {
      return (
        <LinkedIdAndStatus item={source}>
          {source.name} {source.quantification}
        </LinkedIdAndStatus>
      );
    },
    sorter: (item) => item.name,
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
    isSortable: false,
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesCell source={source} />,
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given treatments.
 */
export default function BiomarkerTable({
  biomarkers,
  reportLink = null,
  reportLabel = null,
  title = "Biomarkers",
  isDeletedVisible = false,
  panelId = "biomarkers",
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && reportLabel && (
          <DataAreaTitleLink
            href={reportLink}
            label={reportLabel}
            isDeletedVisible={isDeletedVisible}
          >
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={biomarkers}
          columns={biomarkersColumns}
          keyProp="@id"
        />
      </div>
    </>
  );
}

BiomarkerTable.propTypes = {
  // Biomarkers to display
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to report of biomarkers; use with `reportLabel`
  reportLink: PropTypes.string,
  // Label for report link; use with `reportLink`
  reportLabel: PropTypes.string,
  // Title to display if not "Biomarkers"
  title: PropTypes.string,
  // True to show deleted items in the linked report view
  isDeletedVisible: PropTypes.bool,
  // Unique ID for the section directory
  panelId: PropTypes.string,
};
