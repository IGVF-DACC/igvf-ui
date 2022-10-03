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

const TreatmentList = ({ treatments }) => {
  const treatmentList = treatments["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={treatments}>
        <Collection items={treatmentList}>
          {({ pageItems: pageTreatments, pagerStatus, pagerAction }) => {
            if (treatmentList.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={treatmentList}
                    pagerStatus={pagerStatus}
                  >
                    {pageTreatments.map((treatment) => (
                      <CollectionItem
                        key={treatment.uuid}
                        testid={treatment.uuid}
                        href={treatment["@id"]}
                        label={`Treatment ${treatment.treatment_term_id}`}
                        status={treatment.status}
                      >
                        <CollectionItemName>
                          {treatment.treatment_term_id}
                        </CollectionItemName>
                        {treatment.purpose && <div>{treatment.purpose}</div>}
                        {treatment.treatment_term_name && (
                          <div>{treatment.treatment_term_name}</div>
                        )}
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

TreatmentList.propTypes = {
  // Technical samples to display in the list
  treatments: PropTypes.object.isRequired,
};

export default TreatmentList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const treatments = await request.getCollection("treatments");
  if (FetchRequest.isResponseSuccess(treatments)) {
    const breadcrumbs = await buildBreadcrumbs(
      treatments,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        treatments: treatments,
        pageContext: { title: treatments.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(treatments);
};
