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
import { NoCollectionData } from "../../components/no-content";
import PagePreamble from "../../components/page-preamble";
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs";
import Request from "../../libs/request";

const RodentDonorsList = ({ donors }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {donors.length > 0 ? (
          <>
            <CollectionHeader count={donors.length} />
            <CollectionContent collection={donors}>
              {donors.map((donor) => (
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
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  );
};

RodentDonorsList.propTypes = {
  // Technical samples to display in the list
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RodentDonorsList;

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie);
  const donors = await request.getCollection("rodent-donors");
  const breadcrumbs = await buildBreadcrumbs(donors, "title");
  return {
    props: {
      donors: donors["@graph"],
      pageContext: { title: donors.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  };
};
