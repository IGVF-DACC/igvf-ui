// node_modules
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import AttachmentThumbnail from "./attachment-thumbnail";
import { DataGridContainer } from "./data-grid";
import DocumentAttachmentLink from "./document-link";
import ItemLink from "./item-link";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import TableCount from "./table-count";

/**
 * Columns displayed in the document table.
 */
const columns = [
  {
    id: "@id",
    title: "Page",
    isSortable: false,
    display: ({ source }) => {
      return (
        <ItemLink
          href={source["@id"]}
          label={`View page for document ${source.description}`}
        />
      );
    },
  },
  {
    id: "description",
    title: "Description",
  },
  {
    id: "document_type",
    title: "Type",
  },
  {
    id: "attachment.href",
    title: "Download",
    display: ({ source }) => {
      return <DocumentAttachmentLink document={source} />;
    },
  },
  {
    id: "attachment",
    title: "Preview",
    isSortable: false,
    display: ({ source }) => {
      return (
        <div className="mx-auto self-center">
          <AttachmentThumbnail
            attachment={source.attachment}
            ownerPath={source["@id"]}
            alt={source.description}
            size={60}
          />
        </div>
      );
    },
  },
];

/**
 * Display the given documents in a table, useful for pages displaying objects containing document
 * arrays.
 */
export default function DocumentTable({ documents }) {
  const gridRef = useRef(null);

  return (
    <>
      <TableCount count={documents.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid data={documents} columns={columns} />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

DocumentTable.propTypes = {
  // Documents to display in the table
  documents: PropTypes.array.isRequired,
};
