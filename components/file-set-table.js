// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { DataGridContainer } from "./data-grid";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import Status from "./status";
import TableCount from "./table-count";
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
 * Display a sortable table of the given file sets. Optionally display a link to a report page of
 * the file sets in this table if you provide the `reportLinkInfo` property.
 *
 * To allow this report link to work, the file sets in this table must each include a link back to
 * the currently displayed item. You specify the nature of this link through the `identifierProp`
 * and `itemIdentifier` properties of `reportLinkInfo`. For example, if the file sets in this table
 * include a `samples` property containing the accession of the currently displayed item, then
 * `identifierProp` would contain `samples.accession` and `itemIdentifier` would contain the
 * accession of the currently displayed item.
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
  reportLinkSpecs = null,
  title = "File Sets",
}) {
  // DOM element for the table so we can attach the scroll indicators
  const gridRef = useRef(null);

  // Generate the link to the report page if requested.
  const reportLink = reportLinkSpecs
    ? `/multireport/?type=${reportLinkSpecs.fileSetType}&${
        reportLinkSpecs.identifierProp
      }=${encodeUriElement(
        reportLinkSpecs.itemIdentifier
      )}&field=%40id&field=accession&field=samples&field=lab&field=status&field=aliases`
    : "";

  return (
    <>
      <DataAreaTitle>
        {title}
        {reportLinkSpecs && (
          <DataAreaTitleLink
            href={reportLink}
            label="Report of file sets that belong to this item"
          >
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
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
  // Object for the page containing this file-set table; null to not include a report link
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
