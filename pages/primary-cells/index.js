// node_modules
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  Collection,
  CollectionContent,
  CollectionData,
  CollectionDataLink,
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
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {primaryCells.length > 0 ? (
          <>
            <CollectionHeader count={primaryCells.length} />
            <CollectionContent collection={primaryCells}>
              {primaryCells.map((primaryCell) => (
                <CollectionItem
                  key={primaryCell.uuid}
                  testid={primaryCell.uuid}
                  href={primaryCell["@id"]}
                  label={`Primary Cell ${primaryCell.accession}`}
                  status={primaryCell.status}
                >
                  <CollectionItemName>
                    {primaryCell.accession}
                  </CollectionItemName>
                  <CollectionData>
                    <CollectionDataLink
                      title="Biosample"
                      value={primaryCell.biosample_term.term_name}
                      href={primaryCell.biosample_term["@id"]}
                    />
                  </CollectionData>
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

PrimaryCellList.propTypes = {
  // Primary cells list to display
  primaryCells: PropTypes.arrayOf(PropTypes.object).isRequired,
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
        primaryCells: primaryCells["@graph"],
        pageContext: { title: primaryCells.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(primaryCells);
};
