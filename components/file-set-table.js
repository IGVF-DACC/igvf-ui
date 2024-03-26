// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import SortableGrid from "./sortable-grid";
import Status from "./status";
import { AliasesCell } from "./table-cells";
// lib
import { encodeUriElement } from "../lib/query-encoding";

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
    sorter: (item) => item.summary.toLowerCase(),
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesCell source={source} />,
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title || null,
    sorter: (item) => (item.lab?.title ? item.lab.title.toLowerCase() : ""),
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
 * Display a sortable table of the given file sets. Optionally display a link to a report page of
 * the file sets in this table.
 *
 * To allow this report link to work, the file sets in this table must each include a link back to
 * the currently displayed item. You specify the nature of this link through the `identifierProp`
 * and `itemIdentifier` properties of `reportLinkInfo`. For example, if the file sets in this table
 * include a `samples` property containing the accession of the currently displayed item, then
 * `identifierProp` would contain `samples.accession` and `itemIdentifier` would contain the
 * accession of the currently displayed item.
 *
 * If you want a link to the report page, you must provide either the `reportLink` or
 * `reportLinkSpecs` property (not both). If you provide `reportLink`, it must contain the
 * complete URL of the report page. If you provide `reportLinkSpecs`, it must contain the
 * properties needed to construct the URL of the report page. The `reportLinkSpecs` object must
 * contain the following properties:
 *
 * Summary of the `reportLinkInfo` properties:
 *
 * - reportType: `@type` of the file sets referring to the currently displayed item. The report page
 *   displays only objects of this type. You can use the `FileSet` abstract type if needed here.
 *
 * - identifierProp: Property of the report items that links back to the currently displayed item
 *
 * - itemIdentifier: ID of the currently displayed item that the report items link back to.
 */
export default function FileSetTable({
  fileSets,
  reportLink = "",
  reportLinkSpecs = null,
  title = "File Sets",
}) {
  // Generate the link to the report page if requested.
  const composedReportLink = reportLinkSpecs
    ? `/multireport/?type=${reportLinkSpecs.fileSetType}&${
        reportLinkSpecs.identifierProp
      }=${encodeUriElement(
        reportLinkSpecs.itemIdentifier
      )}&field=%40id&field=accession&field=samples&field=lab&field=status&field=aliases`
    : reportLink;

  return (
    <>
      <DataAreaTitle>
        {title}
        {composedReportLink && (
          <DataAreaTitleLink
            href={composedReportLink}
            label="Report of file sets that belong to this item"
          >
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <SortableGrid
        data={fileSets}
        columns={fileSetColumns}
        keyProp="@id"
        pager={{}}
      />
    </>
  );
}

FileSetTable.propTypes = {
  // File sets to display
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to the report page containing the same file sets as this table
  reportLink: PropTypes.string,
  // Object to build a link to the report page containing the same file sets as this table
  reportLinkSpecs: PropTypes.exact({
    // `@type` of the file sets referring to the currently displayed item
    fileSetType: PropTypes.string.isRequired,
    // Property of the report items that links back to the currently displayed item
    identifierProp: PropTypes.string.isRequired,
    // ID of the currently displayed item that the report items link back to; often accession
    itemIdentifier: PropTypes.string.isRequired,
  }),
  // Title of the table if not "File Sets"
  title: PropTypes.string,
};
