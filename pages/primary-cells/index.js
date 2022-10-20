// node_modules
import PropTypes from "prop-types";
import { AddableItem } from "../../components/add";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  Collection,
  CollectionContent,
  CollectionData,
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

const PrimaryCellList = ({ primaryCells }) => {
  const cellsList = primaryCells["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={primaryCells}>
        <Collection items={cellsList}>
          {({ pageItems: pageSamples, pagerStatus, pagerAction }) => {
            if (cellsList.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={cellsList}
                    pagerStatus={pagerStatus}
                  >
                    {pageSamples.map((primaryCell) => {
                      const termName = primaryCell.biosample_term?.term_name;
                      return (
                        <CollectionItem
                          key={primaryCell.uuid}
                          testid={primaryCell.uuid}
                          href={primaryCell["@id"]}
                          label={`Primary Cell ${primaryCell.accession}`}
                          status={primaryCell.status}
                        >
                          <CollectionItemName>
                            {`${termName ? `${termName} — ` : ""}${
                              primaryCell.accession
                            }`}
                          </CollectionItemName>
                          <CollectionData>
                            <div>{primaryCell.taxa}</div>
                          </CollectionData>
                        </CollectionItem>
                      );
                    })}
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

PrimaryCellList.propTypes = {
  // Primary cells list to display
  primaryCells: PropTypes.object.isRequired,
};

export default PrimaryCellList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const primaryCells = await request.getCollection("primary-cells");
  if (FetchRequest.isResponseSuccess(primaryCells)) {
    await request.getAndEmbedCollectionObjects(
      primaryCells["@graph"],
      "biosample_term"
    );
    const breadcrumbs = await buildBreadcrumbs(
      primaryCells,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        primaryCells: primaryCells,
        pageContext: { title: primaryCells.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(primaryCells);
};
