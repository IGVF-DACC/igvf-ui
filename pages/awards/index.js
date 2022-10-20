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

const AwardList = ({ awards }) => {
  const awardsList = awards["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={awards}>
        <Collection items={awardsList}>
          {({ pageItems: pageAwards, pagerStatus, pagerAction }) => {
            if (awardsList.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={awardsList}
                    pagerStatus={pagerStatus}
                  >
                    {pageAwards.map((award) => (
                      <CollectionItem
                        key={award.uuid}
                        testid={award.uuid}
                        href={award["@id"]}
                        label={`Award ${award.name}`}
                        status={award.status}
                      >
                        <CollectionItemName>{award.name}</CollectionItemName>
                        <div>{award.title}</div>
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

AwardList.propTypes = {
  // Awards to display in the list
  awards: PropTypes.object.isRequired,
};

export default AwardList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const awards = await request.getCollection("awards");
  if (FetchRequest.isResponseSuccess(awards)) {
    const breadcrumbs = await buildBreadcrumbs(
      awards,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        awards: awards,
        pageContext: { title: awards.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(awards);
};
