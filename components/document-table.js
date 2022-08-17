// node_modules
import PropTypes from "prop-types";
// components
import AttachmentThumbnail from "./attachment-thumbnail";
import { DataGridContainer } from "./data-grid";
import DocumentAttachmentLink from "./document-link";
import ItemLink from "./item-link";
import SortableGrid from "./sortable-grid";

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
const DocumentTable = ({ documents }) => {
  return (
    <DataGridContainer>
      <SortableGrid data={documents} columns={columns} />
    </DataGridContainer>
  );
};

DocumentTable.propTypes = {
  // Documents to display in the table
  documents: PropTypes.array.isRequired,
};

export default DocumentTable;
