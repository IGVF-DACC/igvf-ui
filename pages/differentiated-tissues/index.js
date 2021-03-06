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

const DifferentiatedTissueList = ({ differentiatedTissues }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {differentiatedTissues.length > 0 ? (
          <>
            <CollectionHeader count={differentiatedTissues.length} />
            <CollectionContent collection={differentiatedTissues}>
              {differentiatedTissues.map((differentiatedTissue) => (
                <CollectionItem
                  key={differentiatedTissue.uuid}
                  testid={differentiatedTissue.uuid}
                  href={differentiatedTissue["@id"]}
                  label={`Differentiated Tissue ${differentiatedTissue.accession}`}
                  status={differentiatedTissue.status}
                >
                  <CollectionItemName>
                    {differentiatedTissue.accession}
                  </CollectionItemName>
                  {differentiatedTissue.organism && (
                    <div>{differentiatedTissue.organism}</div>
                  )}
                  {differentiatedTissue.nih_institutional_certification && (
                    <div>
                      {differentiatedTissue.nih_institutional_certification}
                    </div>
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

DifferentiatedTissueList.propTypes = {
  // Differentiated tissue list to display
  differentiatedTissues: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DifferentiatedTissueList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const differentiatedTissues = await request.getCollection(
    "differentiated-tissues"
  );
  if (FetchRequest.isResponseSuccess(differentiatedTissues)) {
    const breadcrumbs = await buildBreadcrumbs(differentiatedTissues, "title");
    return {
      props: {
        differentiatedTissues: differentiatedTissues["@graph"],
        pageContext: { title: differentiatedTissues.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(differentiatedTissues);
};
