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

const GeneList = ({ genes }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection items={genes}>
        {({ pageItems: pageGenes, pagerStatus, pagerAction }) => {
          if (genes.length > 0) {
            return (
              <>
                <CollectionHeader
                  pagerStatus={pagerStatus}
                  pagerAction={pagerAction}
                />
                <CollectionContent collection={genes} pagerStatus={pagerStatus}>
                  {pageGenes.map((gene) => (
                    <CollectionItem
                      key={gene.uuid}
                      testid={gene.uuid}
                      href={gene["@id"]}
                      label={`Lab ${gene.title}`}
                      status={gene.status}
                    >
                      <CollectionItemName>{gene.title}</CollectionItemName>
                      <div>{gene.geneid}</div>
                    </CollectionItem>
                  ))}
                </CollectionContent>
              </>
            );
          }

          return <NoCollectionData />;
        }}
      </Collection>
    </>
  );
};

GeneList.propTypes = {
  // Genes to display in the list
  genes: PropTypes.array.isRequired,
};

export default GeneList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const genes = await request.getCollection("genes");
  if (FetchRequest.isResponseSuccess(genes)) {
    const breadcrumbs = await buildBreadcrumbs(
      genes,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        genes: genes["@graph"],
        pageContext: { title: genes.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(genes);
};
