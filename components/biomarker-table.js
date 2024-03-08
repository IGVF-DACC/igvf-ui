// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import SortableGrid from "./sortable-grid";

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
    display: ({ source }) => source.aliases?.join(", "),
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
