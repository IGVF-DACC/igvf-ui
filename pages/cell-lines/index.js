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

const CellLineList = ({ cellLines }) => {
  const cellLinesList = cellLines["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={cellLines}>
        <Collection items={cellLinesList}>
          {({ pageItems: pageSamples, pagerStatus, pagerAction }) => {
            if (cellLinesList.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent
                    collection={cellLinesList}
                    pagerStatus={pagerStatus}
                  >
                    {pageSamples.map((sample) => {
                      const termName = sample.biosample_term?.term_name;
                      return (
                        <CollectionItem
                          key={sample.uuid}
                          testid={sample.uuid}
                          href={sample["@id"]}
                          label={`Cell Line ${sample.title}`}
                          status={sample.status}
                        >
                          <CollectionItemName>
                            {`${termName ? `${termName} — ` : ""}${
                              sample.accession
                            }`}
                          </CollectionItemName>
                          <CollectionData>
                            <div>{sample.taxa}</div>
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

CellLineList.propTypes = {
  // Technical samples to display in the list
  cellLines: PropTypes.object.isRequired,
};

export default CellLineList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const cellLines = await request.getCollection("cell-lines");
  if (FetchRequest.isResponseSuccess(cellLines)) {
    await request.getAndEmbedCollectionObjects(cellLines["@graph"], "source");
    await request.getAndEmbedCollectionObjects(
      cellLines["@graph"],
      "biosample_term"
    );
    const breadcrumbs = await buildBreadcrumbs(
      cellLines,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        cellLines: cellLines,
        pageContext: { title: cellLines.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(cellLines);
};
