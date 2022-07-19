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
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import Request from "../../lib/request";

const PhenotypeOntologyTermList = ({ phenotypeOntologyTerms }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {phenotypeOntologyTerms.length > 0 ? (
          <>
            <CollectionCount count={phenotypeOntologyTerms.length} />
            {phenotypeOntologyTerms.map((phenotypeOntologyTerm) => (
              <CollectionItem
                key={phenotypeOntologyTerm.uuid}
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
  const request = new Request(req?.headers?.cookie);
  const phenotypeOntologyTerms = await request.getCollection("phenotype-terms");
  const breadcrumbs = await buildBreadcrumbs(phenotypeOntologyTerms, "title");
  return {
    props: {
      phenotypeOntologyTerms: phenotypeOntologyTerms["@graph"],
      pageContext: { title: phenotypeOntologyTerms.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  };
};
