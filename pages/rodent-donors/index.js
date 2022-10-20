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

const RodentDonorsList = ({ donors }) => {
  const donorsList = donors["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={donors}>
        <Collection items={donorsList}>
          {({ pageItems: pageDonors, pagerStatus, pagerAction }) => {
            if (donorsList.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={donorsList}
                    pagerStatus={pagerStatus}
                  >
                    {pageDonors.map((donor) => (
                      <CollectionItem
                        key={donor.uuid}
                        testid={donor.uuid}
                        href={donor["@id"]}
                        label={`Human Donor ${donor.accession}`}
                        status={donor.status}
                      >
                        <CollectionItemName>
                          {donor.accession}
                        </CollectionItemName>
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

RodentDonorsList.propTypes = {
  // Technical samples to display in the list
  donors: PropTypes.object.isRequired,
};

export default RodentDonorsList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donors = await request.getCollection("rodent-donors");
  if (FetchRequest.isResponseSuccess(donors)) {
    const breadcrumbs = await buildBreadcrumbs(
      donors,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        donors: donors,
        pageContext: { title: donors.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(donors);
};
