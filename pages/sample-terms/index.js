// node_modules
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  Collection,
  CollectionCount,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs";
import Request from "../../libs/request";

const SampleOntologyTermList = ({ sampleOntologyTerms }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {sampleOntologyTerms.length > 0 ? (
          <>
            <CollectionCount count={sampleOntologyTerms.length} />
            {sampleOntologyTerms.map((sampleOntologyTerm) => (
              <CollectionItem
                key={sampleOntologyTerm.uuid}
                href={sampleOntologyTerm["@id"]}
                label={`Sample ontology term ${sampleOntologyTerm.term_id}`}
                status={sampleOntologyTerm.status}
              >
                <CollectionItemName>
                  {sampleOntologyTerm.term_id}
                </CollectionItemName>
                <div>{sampleOntologyTerm.term_name}</div>
              </CollectionItem>
            ))}
          </>
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  );
};

SampleOntologyTermList.propTypes = {
  // Sample ontology terms to display in the list
  sampleOntologyTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SampleOntologyTermList;

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie);
  const sampleOntologyTerms = await request.getCollection("sample-terms");
  const breadcrumbs = await buildBreadcrumbs(sampleOntologyTerms, "title");
  return {
    props: {
      sampleOntologyTerms: sampleOntologyTerms["@graph"],
      pageContext: { title: sampleOntologyTerms.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  };
};
