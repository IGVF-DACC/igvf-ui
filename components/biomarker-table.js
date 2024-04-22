// node_modules
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
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
export default function BiomarkerTable({ biomarkers, title = "Biomarkers" }) {
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SortableGrid
        data={biomarkers}
        columns={biomarkersColumns}
        pager={{}}
        keyProp="@id"
      />
    </>
  );
}

BiomarkerTable.propTypes = {
  // Biomarkers to display
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title to display if not "Biomarkers"
  title: PropTypes.string,
};
