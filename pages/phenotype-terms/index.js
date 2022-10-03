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

const PhenotypeOntologyTermList = ({ phenotypeOntologyTerms }) => {
  const ontologyTerms = phenotypeOntologyTerms["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={phenotypeOntologyTerms}>
        <Collection items={ontologyTerms}>
          {({ pageItems: pageTerms, pagerStatus, pagerAction }) => {
            if (ontologyTerms.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={ontologyTerms}
                    pagerStatus={pagerStatus}
                  >
                    {pageTerms.map((phenotypeOntologyTerm) => (
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
              );
            }

            return <NoCollectionData />;
          }}
        </Collection>
      </AddableItem>
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
        phenotypeOntologyTerms: phenotypeOntologyTerms,
        pageContext: { title: phenotypeOntologyTerms.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(phenotypeOntologyTerms);
};
