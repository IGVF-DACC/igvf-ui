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

const PhenotypeOntologyTermList = ({ phenotypeOntologyTerms }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {phenotypeOntologyTerms.length > 0 ? (
          <>
            <CollectionHeader count={phenotypeOntologyTerms.length} />
            <CollectionContent collection={phenotypeOntologyTerms}>
              {phenotypeOntologyTerms.map((phenotypeOntologyTerm) => (
                <CollectionItem
                  key={phenotypeOntologyTerm.uuid}
                  testid={phenotypeOntologyTerm.uuid}
                  href={phenotypeOntologyTerm["@id"]}
                  label={`Phenotype ontology term ${phenotypeOntologyTerm.term_id}`}
                  status={phenotypeOntologyTerm.status}
                >
                  <CollectionItemName>
                    {phenotypeOntologyTerm.term_id}
                  </CollectionItemName>
                  <div>{phenotypeOntologyTerm.term_name}</div>
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

PhenotypeOntologyTermList.propTypes = {
  // Phenotype ontology terms to display in the list
  phenotypeOntologyTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default PhenotypeOntologyTermList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const phenotypeOntologyTerms = await request.getCollection("phenotype-terms");
  if (FetchRequest.isResponseSuccess(phenotypeOntologyTerms)) {
    const breadcrumbs = await buildBreadcrumbs(
      phenotypeOntologyTerms,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        phenotypeOntologyTerms: phenotypeOntologyTerms["@graph"],
        pageContext: { title: phenotypeOntologyTerms.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(phenotypeOntologyTerms);
};
