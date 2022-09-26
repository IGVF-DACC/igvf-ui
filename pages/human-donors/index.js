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
import { AddableItem } from '../../components/add';

const HumanDonorsList = ({ donors, donors_obj }) => {
  console.log(donors_obj);
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={donors_obj}>
        <Collection items={donors}>
          {({ pageItems: pageDonors, pagerStatus, pagerAction }) => {
            if (donors.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={donors}
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
                        <CollectionItemName>{donor.accession}</CollectionItemName>
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

HumanDonorsList.propTypes = {
  // Technical samples to display in the list
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  donors_obj: PropTypes.object.isRequired,
};

export default HumanDonorsList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donors = await request.getCollection("human-donors");
  const donors_obj = await request.getObject("/human-donors/?limit=0");
  if (FetchRequest.isResponseSuccess(donors)) {
    const breadcrumbs = await buildBreadcrumbs(
      donors,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        donors: donors["@graph"],
        pageContext: { title: donors.title },
        breadcrumbs,
        donors_obj: donors_obj,
      },
    };
  }
  return errorObjectToProps(donors);
};
