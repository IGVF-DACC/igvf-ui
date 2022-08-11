// node_modules
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  Collection,
  CollectionContent,
  CollectionHeader,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection";
import DocumentAttachmentLink from "../../components/document-link";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const DocumentList = ({ documents }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {documents.length > 0 ? (
          <>
            <CollectionHeader count={documents.length} />
            <CollectionContent collection={documents}>
              {documents.map((document) => (
                <CollectionItem
                  key={document.uuid}
                  testid={document.uuid}
                  href={document["@id"]}
                  label={`Document ${document.description}`}
                  status={document.status}
                >
                  <CollectionItemName>
                    {document.description}
                  </CollectionItemName>
                  <div>
                    <DocumentAttachmentLink document={document} />
                  </div>
                </CollectionItem>
              ))}
            </CollectionContent>
          </>
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  );
};

DocumentList.propTypes = {
  // Documents to display in the list
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DocumentList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const documents = await request.getCollection("documents");
  if (FetchRequest.isResponseSuccess(documents)) {
    const breadcrumbs = await buildBreadcrumbs(
      documents,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        documents: documents["@graph"],
        pageContext: { title: documents.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(documents);
};
