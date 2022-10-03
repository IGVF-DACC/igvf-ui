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

const DifferentiatedCellList = ({ differentiatedCells }) => {
  const differentiatedCellList = differentiatedCells["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={differentiatedCells}>
        <Collection items={differentiatedCellList}>
          {({ pageItems: pageSamples, pagerStatus, pagerAction }) => {
            if (differentiatedCellList.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={differentiatedCellList}
                    pagerStatus={pagerStatus}
                  >
                    {pageSamples.map((differentiatedCell) => {
                      const termName =
                        differentiatedCell.biosample_term?.term_name;
                      return (
                        <CollectionItem
                          key={differentiatedCell.uuid}
                          testid={differentiatedCell.uuid}
                          href={differentiatedCell["@id"]}
                          label={`Differentiated Cell ${differentiatedCell.accession}`}
                          status={differentiatedCell.status}
                        >
                          <CollectionItemName>
                            {`${termName ? `${termName} — ` : ""}${
                              differentiatedCell.accession
                            }`}
                          </CollectionItemName>
                          <CollectionData>
                            <div>{differentiatedCell.taxa}</div>
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

DifferentiatedCellList.propTypes = {
  // Differentiated cells list to display
  differentiatedCells: PropTypes.object.isRequired,
};

export default DifferentiatedCellList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const differentiatedCells = await request.getCollection(
    "differentiated-cells"
  );
  if (FetchRequest.isResponseSuccess(differentiatedCells)) {
    await request.getAndEmbedCollectionObjects(
      differentiatedCells["@graph"],
      "biosample_term"
    );
    const breadcrumbs = await buildBreadcrumbs(differentiatedCells, "title");
    return {
      props: {
        differentiatedCells: differentiatedCells,
        pageContext: { title: differentiatedCells.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(differentiatedCells);
};
