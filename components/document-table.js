// node_modules
import PropTypes from "prop-types";
// components
import AttachmentThumbnail from "./attachment-thumbnail";
import { DataAreaTitle } from "./data-area";
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
    sorter: (item) => item.attachment.download.toLowerCase(),
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
export default function DocumentTable({ documents, title = "Documents" }) {
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SortableGrid data={documents} columns={columns} pager={{}} />
    </>
  );
}

DocumentTable.propTypes = {
  // Documents to display in the table
  documents: PropTypes.array.isRequired,
  // Title of the table if not "Documents"
  title: PropTypes.string,
};
