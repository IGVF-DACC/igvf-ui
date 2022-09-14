// node_modules
import PropTypes from "prop-types";
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

const TissueList = ({ tissues }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {tissues.length > 0 ? (
          <>
            <CollectionHeader count={tissues.length} />
            <CollectionContent collection={tissues}>
              {tissues.map((tissue) => {
                const termName = tissue.biosample_term?.term_name;
                return (
                  <CollectionItem
                    key={tissue.uuid}
                    testid={tissue.uuid}
                    href={tissue["@id"]}
                    label={`Tissue ${tissue.accession}`}
                    status={tissue.status}
                  >
                    <CollectionItemName>
                      {`${termName ? `${termName} — ` : ""}${tissue.accession}`}
                    </CollectionItemName>
                    <CollectionData>
                      <div>{tissue.taxa}</div>
                    </CollectionData>
                  </CollectionItem>
                );
              })}
            </CollectionContent>
          </>
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  );
};

TissueList.propTypes = {
  // Tissue samples to display in the list
  tissues: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default TissueList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const tissues = await request.getCollection("tissues");
  if (FetchRequest.isResponseSuccess(tissues)) {
    await request.getAndEmbedCollectionObjects(
      tissues["@graph"],
      "biosample_term"
    );
    const breadcrumbs = await buildBreadcrumbs(
      tissues,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        tissues: tissues["@graph"],
        pageContext: { title: tissues.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(tissues);
};
