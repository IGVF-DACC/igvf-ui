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
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const AssayOntologyTermList = ({ assayOntologyTerms }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {assayOntologyTerms.length > 0 ? (
          <>
            <CollectionHeader count={assayOntologyTerms.length} />
            <CollectionContent collection={assayOntologyTerms}>
              {assayOntologyTerms.map((assayOntologyTerm) => (
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
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  );
};

AssayOntologyTermList.propTypes = {
  // Assay terms to display in the list
  assayOntologyTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default AssayOntologyTermList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const assayOntologyTerms = await request.getCollection("assay-terms");
  if (FetchRequest.isResponseSuccess(assayOntologyTerms)) {
    const breadcrumbs = await buildBreadcrumbs(assayOntologyTerms, "title");
    return {
      props: {
        assayOntologyTerms: assayOntologyTerms["@graph"],
        pageContext: { title: assayOntologyTerms.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(assayOntologyTerms);
};
