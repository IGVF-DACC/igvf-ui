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
              {tissues.map((tissue) => (
                <CollectionItem
                  key={tissue.uuid}
                  testid={tissue.uuid}
                  href={tissue["@id"]}
                  label={`Tissue ${tissue.accession}`}
                  status={tissue.status}
                >
                  <CollectionItemName>{tissue.accession}</CollectionItemName>
                  {tissue.organism && <div>{tissue.organism}</div>}
                  {tissue.nih_institutional_certification && (
                    <div>{tissue.nih_institutional_certification}</div>
                  )}
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

TissueList.propTypes = {
  // Tissue samples to display in the list
  tissues: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default TissueList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const tissues = await request.getCollection("tissues");
  if (FetchRequest.isResponseSuccess(tissues)) {
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
