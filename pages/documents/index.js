// node_modules
import PropTypes from "prop-types";
import { AddableItem } from "../../components/add";
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
  const documentsList = documents["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={documents}>
        <Collection items={documentsList}>
          {({ pageItems: pageDocuments, pagerStatus, pagerAction }) => {
            if (documentsList.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={documentsList}
                    pagerStatus={pagerStatus}
                  >
                    {pageDocuments.map((document) => (
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
              );
            }

            return <NoCollectionData />;
          }}
        </Collection>
      </AddableItem>
    </>
  );
};

DocumentList.propTypes = {
  // Documents to display in the list
  documents: PropTypes.object.isRequired,
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
        documents: documents,
        pageContext: { title: documents.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(documents);
};
