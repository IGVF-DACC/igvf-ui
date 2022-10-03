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

const SampleOntologyTermList = ({ sampleOntologyTerms }) => {
  const termsList = sampleOntologyTerms["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={sampleOntologyTerms}>
        <Collection items={termsList}>
          {({ pageItems: pageTerms, pagerStatus, pagerAction }) => {
            if (termsList.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={termsList}
                    pagerStatus={pagerStatus}
                  >
                    {pageTerms.map((sampleOntologyTerm) => (
                      <CollectionItem
                        key={sampleOntologyTerm.uuid}
                        testid={sampleOntologyTerm.uuid}
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

SampleOntologyTermList.propTypes = {
  // Sample ontology terms to display in the list
  sampleOntologyTerms: PropTypes.object.isRequired,
};

export default SampleOntologyTermList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sampleOntologyTerms = await request.getCollection("sample-terms");
  if (FetchRequest.isResponseSuccess(sampleOntologyTerms)) {
    const breadcrumbs = await buildBreadcrumbs(
      sampleOntologyTerms,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        sampleOntologyTerms: sampleOntologyTerms,
        pageContext: { title: sampleOntologyTerms.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(sampleOntologyTerms);
};
