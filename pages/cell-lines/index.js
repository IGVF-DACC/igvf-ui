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
import SourceProp from "../../components/source-prop";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const CellLineList = ({ cellLines }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {cellLines.length > 0 ? (
          <>
            <CollectionHeader count={cellLines.length} />
            <CollectionContent collection={cellLines}>
              {cellLines.map((sample) => (
                <CollectionItem
                  key={sample.uuid}
                  testid={sample.uuid}
                  href={sample["@id"]}
                  label={`Cell Line ${sample.title}`}
                  status={sample.status}
                >
                  <CollectionItemName>{sample.accession}</CollectionItemName>
                  <SourceProp source={sample.source} />
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

CellLineList.propTypes = {
  // Technical samples to display in the list
  cellLines: PropTypes.array.isRequired,
};

export default CellLineList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const cellLines = await request.getCollection("cell-lines");
  if (FetchRequest.isResponseSuccess(cellLines)) {
    await request.getAndEmbedCollectionObjects(cellLines["@graph"], "source");
    const breadcrumbs = await buildBreadcrumbs(
      cellLines,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        cellLines: cellLines["@graph"],
        pageContext: { title: cellLines.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(cellLines);
};
