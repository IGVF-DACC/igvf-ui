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
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const AssayOntologyTermList = ({ assayOntologyTerms }) => {
  const assayTerms = assayOntologyTerms["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={assayOntologyTerms}>
        <Collection items={assayTerms}>
          {({ pageItems: pageTerms, pagerStatus, pagerAction }) => {
            if (assayTerms.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={assayTerms}
                    pagerStatus={pagerStatus}
                  >
                    {pageTerms.map((assayOntologyTerm) => (
                      <CollectionItem
                        key={assayOntologyTerm.uuid}
                        testid={assayOntologyTerm.uuid}
                        href={assayOntologyTerm["@id"]}
                        label={`Assay term ${assayOntologyTerm.term_id}`}
                        status={assayOntologyTerm.status}
                      >
                        <CollectionItemName>
                          {assayOntologyTerm.term_id}
                        </CollectionItemName>
                        <div>{assayOntologyTerm.term_name}</div>
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

AssayOntologyTermList.propTypes = {
  // Assay terms to display in the list
  assayOntologyTerms: PropTypes.object.isRequired,
};

export default AssayOntologyTermList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const assayOntologyTerms = await request.getCollection("assay-terms");
  if (FetchRequest.isResponseSuccess(assayOntologyTerms)) {
    const breadcrumbs = await buildBreadcrumbs(assayOntologyTerms, "title");
    return {
      props: {
        assayOntologyTerms: assayOntologyTerms,
        pageContext: { title: assayOntologyTerms.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(assayOntologyTerms);
};
